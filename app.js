import {createSession} from "better-sse"

const express = require('express')
const axios = require('axios')
const {Configuration, OpenAIApi} = require('openai')
const path = require("path")

const app = express()
const port = 5000

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const clientAppFolder = path.join(__dirname, 'ClientApp')

let system_settings = {
    "role": "system",
    "content": "Представь, что ты школьный учитель. Тебе нужно отвечать на вопросы учеников. В твоих ответах ты должен быть приветлив и максимально четко объяснить школьную тему, которую у тебя спросили."
}

let messages_history = [
    system_settings
]

// В конце твоего ответа приводи ссылки на 3 YouTube видео, связанных с этой темой.

// Добавление Middleware на парсинг JSON'а.
app.use(express.json());

// Добавление Middleware на обработку статического контента по этому пути.
app.use('/', express.static(clientAppFolder));

// Сброс всей истории сообщений.
app.get('/reset', (req, res) => {
    messages_history = system_settings;
});

app.get('/ask', async (req, res) => {

    const session = await createSession(req, res);

    messages_history.push({
        "role": "user",
        "content": req.query.prompt
    });


    const {data} = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages_history,
        stream: true
    }, {
        timeout: 1000 * 60 * 2,
        responseType: 'stream'
    });

    data.on('data', text => {
        const lines = text.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') { //OpenAI sends [DONE] to say it's over
                session.push('DONE', 'error');
                return;
            }
            try {
                const {choices} = JSON.parse(message);
                session.push({text: choices[0].text});
            } catch (err) {
                console.log(err);
            }
        }
    });

    data.on('close', () => {
        console.log("close")
        res.end();
    });

    data.on('error', (err) => {
        console.error(err);
    });


});

app.listen(port, () => {
    console.log(`Application started on port ${port}`);
});


// const { question } = req.body;
//
// messages_history.push({
//     "role": "user",
//     "content": question
// });
//
// const completion = await openai.createChatCompletion({
//     model: "gpt-3.5-turbo",
//     messages: messages_history
// });
//
// const response = completion.data.choices[0].message.content;
//
// messages_history.push({
//     "role": "assistant",
//     "content": response
// });
//
// res.send({"response": response});
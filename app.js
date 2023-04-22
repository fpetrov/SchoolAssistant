const express = require('express')
const axios = require('axios')
const { Configuration, OpenAIApi } = require('openai')
const path = require("path")

const app = express()
const port = 5000

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const clientAppFolder = path.join(__dirname, 'ClientApp')

let messages_history = [
    {
        "role": "system",
        "content": "Представь, что ты школьный учитель. Тебе нужно отвечать на вопросы учеников. В твоих ответах ты должен быть приветлив и максимально четко объяснить школьную тему, которую у тебя спросили."
    }
]

// В конце твоего ответа приводи ссылки на 3 YouTube видео, связанных с этой темой.

// Добавление Middleware на парсинг JSON'а.
app.use(express.json());

// Добавление Middleware на обработку статического контента по этому пути.
app.use('/', express.static(clientAppFolder));

app.post('/ask', async (req, res) => {
    const { question } = req.body;

    messages_history.push({
        "role": "user",
        "content": question
    });

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages_history
    });

    const response = completion.data.choices[0].message.content;

    messages_history.push({
        "role": "assistant",
        "content": response
    });

    res.send(messages_history);
});

app.listen(port, () => {
    console.log(`Application started on port ${port}`)
});
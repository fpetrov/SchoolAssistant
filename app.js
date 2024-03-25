const express = require('express')
const {Configuration, OpenAIApi} = require('openai')
const path = require('path')

const app = express()
const port = 5000

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

//const clientAppFolder = path.join(__dirname, 'ClientApp')

app.use(express.json());

//app.use('/', express.static(clientAppFolder));


app.post('/ask', async (req, res) => {
    const { messages_history } = req.body;

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages_history
    });

    const response = completion.data.choices[0].message.content;

    res.send({
        "role": "assistant",
        "content": response
    });
});

app.listen(port, () => {
    console.log(`Application started on port ${port}`);
});
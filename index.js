const appWs = require('./app-ws');

const express = require('express');

const cors = require('cors');

const mqtt = require('mqtt');

const client = mqtt.connect(process.env.BROKER_URL);

const app = express();

const topicName = 'temperatura';

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));

app.use(express.json());

let temperatura = 0;


// API Rest
app.get('/temperatura', (req, res, next) => {
    res.json({
        temp: temperatura
    });
});


client.on('connect', () => {
    client.subscribe(topicName, { qos: 0 }, (err,granted) => {
        if (err) {
            console.log(err, 'err');
        }
        console.log(granted, 'garantido');
    })
})

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`A API Express em execução!`);
});

const wss = appWs(server);

client.on('message', function (topic, message) {
    console.log("mensagem: ", message.toString());
    temperatura = parseFloat(message.toString());

    wss.broadcast({ temp: parseFloat(message.toString()) });
});

wss.on('connection', function() {
    wss.broadcast({ temp: temperatura })
});
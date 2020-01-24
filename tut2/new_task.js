#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const secret = require('../.secret.json');

const opt = { credentials: require('amqplib').credentials.plain(secret.user, secret.pass) };

amqp.connect(`amqp://${secret.ip}`, opt, function(error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'task_queue';
        var msg = process.argv.slice(2).join(' ') || "Hello World!";

        channel.assertQueue(queue, {
            durable: true
        });

        channel.sendToQueue(queue, Buffer.from(msg), {
            persistent: true
        });
        console.log(" [x] Sent %s", msg);
    });

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});


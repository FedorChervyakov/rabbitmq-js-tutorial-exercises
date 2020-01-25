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

        var exchange = 'topic_logs';
        var args = process.argv.slice(2);
        var key = (args.length > 0) ? args[0] : 'anonymous.info';
        var msg = args.slice(1).join(' ') || "Hello World!";

        channel.assertExchange(exchange, 'topic', {
            durable: false
        });

        channel.publish(exchange, key, Buffer.from(msg));
        console.log(" [x] Sent %s: '%s'", key, msg);
    });

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
});


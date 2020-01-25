#!/usr/bin/env node

const amqp = require('amqplib/callback_api');
const secret = require('../.secret.json');

const opt = { credentials: require('amqplib').credentials.plain(secret.user, secret.pass) };

var args = process.argv.slice(2);

if (args.length == 0) {
    console.log("Usage: receive_logs_direct.js <facility>.<severity>");
    process.exit(1);
}

amqp.connect(`amqp://${secret.ip}`, opt, function(error0, connection) {
    if (error0) {
        throw error0;
    }

    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var exchange = 'topic_logs';
        
        channel.assertExchange(exchange, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            
            console.log(" [*] Waiting for logs. To exit press CTRL+C");
            args.forEach(function(key) {
                channel.bindQueue(q.queue, exchange, key);
            });
            
            channel.consume(q.queue, function(msg) {
                console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
            }, {
                noAck: true
            });
        });
    });
});

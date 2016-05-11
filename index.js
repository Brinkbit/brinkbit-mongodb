'use strict';

exports.port = process.env.PORT || 3000;
exports.mongodb = {
    ip: process.env.MONGO_IP || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
};
exports.mongodb.uri = exports.mongodb.user && exports.mongodb.pass ?
    `mongodb://${exports.mongodb.user}:${exports.mongodb.pass}@${exports.mongodb.ip}:${exports.mongodb.port}/test` :
    `mongodb://${exports.mongodb.ip}:${exports.mongodb.port}/test`;
exports.cryptoKey = process.env.CRYPTO_KEY;
exports.loginAttempts = {
    forIp: 50,
    forIpAndUser: 7,
    logExpiration: '20m',
};

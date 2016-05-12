'use strict';

const logger = require( 'brinkbit-logger' )({ __filename, transport: 'production' });
const mongoose = require( 'mongoose' );
const conn = mongoose.connection;
mongoose.Promise = Promise;

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

exports.connect = () => {
    return new Promise(( resolve, reject ) => {
        if ( conn.readyState === 1 ) {
            logger.warning( 'Already connected. Resolving.' );
            return resolve();
        }

        const mongodbURI = exports.mongodb.uri;
        logger.info( `Attempting to connect to: ${mongodbURI}` );
        mongoose.connect( mongodbURI );
        conn.on( 'error', ( err ) => reject( err ));
        conn.on( 'connected', resolve );
    });
};

exports.disconnect = () => {
    return new Promise(( resolve ) => {
        if ( conn.readyState === 0 ) {
            logger.warning( 'No connection to disconnect. Resolving.' );
            return resolve();
        }

        logger.info( 'Closing mongoose connection' );
        conn.close();
    });
};

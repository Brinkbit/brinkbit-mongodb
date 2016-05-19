'use strict';

const logger = require( 'brinkbit-logger' )({ __filename, transport: 'debug' });

const port = process.env.PORT || 3000;
const mongodb = {
    ip: process.env.MONGO_IP || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
};
mongodb.uri = mongodb.user && mongodb.pass ?
    `mongodb://${mongodb.user}:${mongodb.pass}@${mongodb.ip}:${mongodb.port}/test` :
    `mongodb://${mongodb.ip}:${mongodb.port}/test`;
const cryptoKey = process.env.CRYPTO_KEY;
const loginAttempts = {
    forIp: 50,
    forIpAndUser: 7,
    logExpiration: '20m',
};

function connect( mongoose ) {
    const conn = mongoose.connection;
    return new Promise(( resolve, reject ) => {
        console.log( 'connection is undefined here' );
        if ( conn.readyState === 1 ) {
            logger.warning( 'Already connected. Resolving.' );
            return resolve();
        }

        const mongodbURI = mongodb.uri;

        logger.info( `Attempting to connect to: ${mongodbURI}` );
        mongoose.connect( mongodbURI );
        conn.on( 'error', ( err ) => reject( err ));
        conn.on( 'connected', () => {
            logger.info( 'Connected!' );
            resolve();
        });
    });
}

function disconnect( mongoose ) {
    const conn = mongoose.connection;
    return new Promise(( resolve ) => {
        if ( conn.readyState === 0 ) {
            logger.warning( 'No connection to disconnect. Resolving.' );
            return resolve();
        }

        logger.info( 'Closing mongoose connection' );
        conn.close();
    });
}

module.exports = ( mongoose ) => {
    const conn = mongoose.connection;
    mongoose.Promise = Promise;
    return {
        port,
        mongodb,
        cryptoKey,
        loginAttempts,
        connect: () => connect( conn ),
        disconnect: () => disconnect( conn ),
    };
};

'use strict';

const logger = require( 'brinkbit-logger' )({ __filename, transport: 'production' });

const port = process.env.PORT || 3000;
const mongodb = {
    ip: process.env.MONGO_IP || 'localhost',
    port: process.env.MONGO_PORT || '27017',
    user: process.env.MONGO_USER,
    pass: process.env.MONGO_PASS,
    database: process.env.MONGO_DB || 'test',
};
mongodb.uri = mongodb.user && mongodb.pass ?
    `mongodb://${mongodb.user}:${mongodb.pass}@${mongodb.ip}:${mongodb.port}/${mongodb.database}` :
    `mongodb://${mongodb.ip}:${mongodb.port}/${mongodb.database}`;

function connect( mongooseConnection ) {
    return new Promise(( resolve, reject ) => {
        if ( mongooseConnection.readyState === 1 ) {
            logger.warning( 'Already connected. Resolving.' );
            return resolve();
        }

        logger.info( `Attempting to connect to: ${mongodb.uri}` );
        mongooseConnection
        .removeAllListeners( 'connected' ).on( 'connected', () => {
            logger.info( 'Connected!' );
            resolve();
        })
        .removeAllListeners( 'error' ).on( 'error', ( err ) => {
            logger.crit( `mongoose connection error: "${err.message}"`, {
                message: err.message,
                uri: mongodb.uri,
            });
            reject( err );
        })
        .open( mongodb.uri );
    });
}

function disconnect( mongooseConnection ) {
    return new Promise(( resolve, reject ) => {
        if ( mongooseConnection.readyState === 0 ) {
            logger.warning( 'No connection to disconnect. Resolving.' );
            return resolve();
        }

        logger.info( 'Closing mongoose connection' );
        mongooseConnection
        .removeAllListeners( 'close' ).on( 'close', () => {
            logger.info( 'Mongoose connection closed' );
            resolve();
        })
        .removeAllListeners( 'error' ).on( 'error', ( err ) => {
            logger.crit( `mongoose connection error: "${err.message}"`, {
                message: err.message,
                uri: mongodb.uri,
            });
            reject( err );
        })
        .close();
    });
}

module.exports = ( mongooseConnection ) => {
    return {
        port,
        mongodb,
        connect: () => connect( mongooseConnection ),
        disconnect: () => disconnect( mongooseConnection ),
    };
};

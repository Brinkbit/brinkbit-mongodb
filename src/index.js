'use strict';

const logger = require( 'brinkbit-logger' )({ __filename });

function connect( mongodb, mongooseConnection ) {
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

function disconnect( mongodb, mongooseConnection ) {
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

module.exports = ( mongooseConnection, config ) => {
    const upstreamConfig = config || {};
    const mongodb = {
        ip: upstreamConfig.ip || process.env.MONGO_IP || 'localhost',
        port: upstreamConfig.port || process.env.MONGO_PORT || '27017',
        user: upstreamConfig.user || process.env.MONGO_USER,
        pass: upstreamConfig.pass || process.env.MONGO_PASS,
        database: upstreamConfig.database || process.env.MONGO_DB || 'test',
    };
    mongodb.uri = mongodb.user && mongodb.pass ?
        `mongodb://${mongodb.user}:${mongodb.pass}@${mongodb.ip}:${mongodb.port}/${mongodb.database}` :
        `mongodb://${mongodb.ip}:${mongodb.port}/${mongodb.database}`;
    return {
        config: mongodb,
        connect: () => connect( mongodb, mongooseConnection ),
        disconnect: () => disconnect( mongodb, mongooseConnection ),
    };
};

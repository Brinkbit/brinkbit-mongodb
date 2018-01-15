const mongoose = require( 'mongoose' );
const logger = require( 'brinkbit-logger' ).configure();

function getConnection( mongodb, connection ) {
    if ( !connection ) {
        return mongoose.connection;
    }
    if ( typeof connection.createConnection === 'function' ) {
        return connection.createConnection( mongodb.uri, { });
    }
    if (
        typeof connection.removeAllListeners === 'function' &&
        typeof connection.openUri === 'function'
    ) {
        return connection;
    }
    return null;
}

function connect( mongodb, connection ) {
    return new Promise(( resolve, reject ) => {
        const mongooseConnection = getConnection( mongodb, connection );
        if ( !mongooseConnection ) {
            logger.error( 'mongoose connection error: "Invalid connection"', {
                message: 'Invalid connection',
                uri: mongodb.uri,
            });
            reject( new Error( 'Invalid connection' ));
        }

        if ( mongooseConnection.readyState === 1 ) {
            logger.warning( 'Already connected. Resolving.' );
            return resolve( mongooseConnection );
        }

        logger.info( `Attempting to connect to: ${mongodb.uri}` );
        mongooseConnection
        .removeAllListeners( 'connected' ).on( 'connected', () => {
            logger.info( 'Connected!' );
            resolve( mongooseConnection );
        })
        .removeAllListeners( 'error' ).on( 'error', ( err ) => {
            logger.error( `mongoose connection error: "${err.message}"`, {
                message: err.message,
                uri: mongodb.uri,
            });
            reject( err );
        });

        if ( mongooseConnection.readyState === 0 ) {
            return mongooseConnection.openUri( mongodb.uri );
        }
        return logger.warning( 'Already connecting' );
    });
}

function disconnect( mongodb, mongooseConnection ) {
    return new Promise(( resolve, reject ) => {
        if ( mongooseConnection.readyState === 0 ) {
            logger.warning( 'No connection to disconnect. Resolving.' );
            return resolve();
        }

        logger.info( 'Closing mongoose connection' );
        return mongooseConnection
        .removeAllListeners( 'close' ).on( 'close', () => {
            logger.info( 'Mongoose connection closed' );
            resolve();
        })
        .removeAllListeners( 'error' ).on( 'error', ( err ) => {
            logger.error( `mongoose connection error: "${err.message}"`, {
                message: err.message,
                uri: mongodb.uri,
            });
            reject( err );
        })
        .close();
    });
}

function createMongosConfig( mongos ) {
    const upstreamConfigs = mongos || [];
    if ( !upstreamConfigs.length && !process.env.MONGO_MONGOS_COUNT ) return undefined;
    const configs = [];
    let count = 0;
    if ( upstreamConfigs.length > 0 ) {
        count = upstreamConfigs.length;
    }
    else if ( process.env.MONGO_MONGOS_COUNT ) {
        count = process.env.MONGO_MONGOS_COUNT;
    }
    for ( let i = 0; i < count; i += 1 ) {
        const config = upstreamConfigs[i] || {};
        const newConfig = {
            host: config.host || process.env[`MONGO_HOST_${i}`] || `${process.env.MONGO_HOST || 'db'}-${i + 1}`,
            port: config.port || process.env[`MONGO_PORT_${i}`] || process.env.MONGO_PORT || '27017',
        };
        newConfig.string = `${newConfig.host}:${newConfig.port}`;
        configs.push( newConfig );
    }
    return configs.length ? configs : undefined;
}

module.exports = ( mongooseConnection, config ) => {
    const upstreamConfig = config || {};
    const mongodb = {
        host: upstreamConfig.host || process.env.MONGO_HOST || upstreamConfig.ip || process.env.MONGO_IP || 'localhost',
        port: upstreamConfig.port || process.env.MONGO_PORT || '27017',
        user: upstreamConfig.user || process.env.MONGO_USER,
        pass: upstreamConfig.pass || process.env.MONGO_PASS,
        database: upstreamConfig.database || process.env.MONGO_DB || 'test',
        mongos: createMongosConfig( upstreamConfig.mongos ),
        options: upstreamConfig.options,
        replicaSet: upstreamConfig.replicaSet || process.env.MONGO_REPLICA_SET,
    };
    const hostsAndPorts = mongodb.mongos ?
        mongodb.mongos.map( mongo => `${mongo.host}:${mongo.port}` ).join( ',' ) :
        `${mongodb.host}:${mongodb.port}`;
    const replicaString = mongodb.replicaSet ? `?replicaSet=${mongodb.replicaSet}` : '';
    mongodb.uri = upstreamConfig.uri || process.env.MONGO_URI || ( mongodb.user && mongodb.pass ?
        `mongodb://${mongodb.user}:${mongodb.pass}@${hostsAndPorts}/${mongodb.database}${replicaString}` :
        `mongodb://${hostsAndPorts}/${mongodb.database}${replicaString}` );
    return {
        config: mongodb,
        connect: () => connect( mongodb, mongooseConnection ),
        disconnect: connection => disconnect(
            mongodb,
            connection || mongooseConnection || mongoose.connection
        ),
    };
};

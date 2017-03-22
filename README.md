# brinkbit-mongodb
Small module to standardize connecting to mongoDB.
Decouple connection strings from code using a combination of environment variables and json.

# Install

```
npm i --save brinkbit-mongodb
```

or

```
yarn add brinkbit-mongodb
```

# Usage

Uses environment variables with default local configuration.

```javascript
const mongoose = require( 'mongoose' );
const db = require( 'brinkbit-mongodb' )( mongoose.connection );

db.connect()
.then(() => {
    console.log( 'connected!' );
    return db.disconnect();
})
.then(() => {
    console.log( 'disconnected!' );
});
```

# Environment Variables

```javascript
process.env.MONGO_HOST // default 'localhost'
process.env.MONGO_PORT // default 27017
process.env.MONGO_DB // default 'test'
process.env.MONGO_USER // optional
process.env.MONGO_PASS // optional
process.env.MONGO_REPLICA_SET // optional
process.env.MONGO_MONGOS_COUNT // will attempt to create mongos-compliant uri
process.env.MONGO_HOST_<number> // more fine-grained control over mongos hosts
process.env.MONGO_PORT_<number> // more fine-grained control over mongos ports
process.env.MONGO_URI // overrides everything else
process.env.MONGO_IP // deprecated use MONGO_HOST instead
```

# Manual Configuration

JSON configuration always takes precedence over environment variables

```javascript
const db = require( 'brinkbit-mongodb' )( mongoose.connection, {
    host: 'manualHost', // default 'localhost'
    port: 'manualPort', // default 27017
    database: 'manualDB', // default 'test'
    user: 'manualUser', // optional
    pass: 'manualPassword', // optional
    replicaSet: 'manualReplica', // optional
    mongos: [{
        host: 'host1', // defaults to `${top level host}-${index + 1}`
        port: 'port1' // defaults to top level port
    }],
    uri: 'http://manualURI', // overrides everything else
    ip: 'manualIp', // deprecated use host instead
    options: {} // mongoose connection options http://mongoosejs.com/docs/connections.html#options
});
```

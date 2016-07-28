# brinkbit-mongodb
Small module to standardize connecting to mongoDB

# Install

```
npm i --save brinkbit-mongodb
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
process.env.MONGO_IP
process.env.MONGO_PORT
process.env.MONGO_USER
process.env.MONGO_PASS
process.env.MONGO_DB
```

# Manual Configuration

```javascript
const db = require( 'brinkbit-mongodb' )( mongoose.connection, {
    ip: 'manualIp',
    port: 'manualPort',
    user: 'manualUser',
    pass: 'manualPassword',
    database: 'manualDB',
});
```

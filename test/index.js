const chai = require( 'chai' );
const chaiaspromised = require( 'chai-as-promised' );
const mongoose = require( 'mongoose' );

const expect = chai.expect;
chai.use( chaiaspromised );

describe( 'mongoose configuration', function() {
    describe( 'default test configuration', function() {
        const db = require( '../src' )( mongoose.connection );

        afterEach( function() {
            return db.disconnect();
        });

        it( 'should have the appropriate default configuration', function() {
            expect( db.config ).to.deep.equal({
                host: 'localhost',
                mongos: undefined,
                options: undefined,
                replicaSet: undefined,
                pass: undefined,
                user: undefined,
                port: '27017',
                database: 'test',
                uri: 'mongodb://localhost:27017/test',
            });
        });

        it( 'should resolve when it tries to disconnect without a connection', function() {
            return expect( db.disconnect()).to.eventually.be.fulfilled;
        });

        it( 'should be able to connect with the default configuration', function() {
            return expect( db.connect()).to.eventually.be.fulfilled;
        });

        it( 'should be able to disconnect after connection', function() {
            return expect( db.disconnect()).to.eventually.be.fulfilled;
        });

        it( 'should resolve if it is already connected', function() {
            return db.connect()
            .then(() => {
                expect( db.connect()).to.eventually.be.fulfilled;
            });
        });
    });

    describe( 'environment variable configuration', function() {
        it( 'should have the appropriate configuration', function() {
            process.env.MONGO_HOST = 'testHost';
            process.env.MONGO_PORT = 'testPort';
            process.env.MONGO_USER = 'testUser';
            process.env.MONGO_PASS = 'testPassword';
            process.env.MONGO_DB = 'testDB';
            const db = require( '../src' )( mongoose.connection );
            expect( db.config ).to.deep.equal({
                host: 'testHost',
                mongos: undefined,
                options: undefined,
                replicaSet: undefined,
                port: 'testPort',
                user: 'testUser',
                pass: 'testPassword',
                uri: 'mongodb://testUser:testPassword@testHost:testPort/testDB',
                database: 'testDB',
            });
        });

        describe( 'MONGO_MONGOS_COUNT simple configuration', function() {
            it( 'should have the appropriate configuration', function() {
                process.env.MONGO_MONGOS_COUNT = 2;
                process.env.MONGO_HOST = 'testHost';
                process.env.MONGO_PORT = 'testPort';
                process.env.MONGO_USER = 'testUser';
                process.env.MONGO_PASS = 'testPassword';
                process.env.MONGO_DB = 'testDB';
                const db = require( '../src' )( mongoose.connection );
                expect( db.config ).to.deep.equal({
                    host: 'testHost',
                    mongos: [{
                        port: 'testPort',
                        host: 'testHost-1',
                        string: 'testHost-1:testPort',
                    }, {
                        port: 'testPort',
                        host: 'testHost-2',
                        string: 'testHost-2:testPort',
                    }],
                    options: undefined,
                    replicaSet: undefined,
                    port: 'testPort',
                    user: 'testUser',
                    pass: 'testPassword',
                    uri: 'mongodb://testUser:testPassword@testHost-1:testPort,testHost-2:testPort/testDB',
                    database: 'testDB',
                });
            });
        });

        afterEach( function() {
            delete process.env.MONGO_MONGOS_COUNT;
            delete process.env.MONGO_HOST;
            delete process.env.MONGO_PORT;
            delete process.env.MONGO_USER;
            delete process.env.MONGO_PASS;
            delete process.env.MONGO_DB;
        });
    });

    describe( 'manual configuration', function() {
        it( 'should have the appropriate configuration', function() {
            process.env.MONGO_HOST = 'testHost';
            process.env.MONGO_PORT = 'testPort';
            process.env.MONGO_USER = 'testUser';
            process.env.MONGO_PASS = 'testPassword';
            process.env.MONGO_DB = 'testDB';
            const db = require( '../src' )( mongoose.connection, {
                host: 'manualHost',
                port: 'manualPort',
                database: 'manualDB',
                user: 'manualUser',
                pass: 'manualPassword',
                replicaSet: 'manualReplica',
                mongos: [{
                    host: 'host1',
                    port: 'port1',
                }],
                ip: 'manualIp',
                options: {},
            });
            expect( db.config ).to.deep.equal({
                host: 'manualHost',
                mongos: [{
                    host: 'host1',
                    port: 'port1',
                    string: 'host1:port1',
                }],
                options: {},
                replicaSet: 'manualReplica',
                port: 'manualPort',
                user: 'manualUser',
                pass: 'manualPassword',
                uri: 'mongodb://manualUser:manualPassword@host1:port1/manualDB?replicaSet=manualReplica',
                database: 'manualDB',
            });
        });

        after( function() {
            delete process.env.MONGO_HOST;
            delete process.env.MONGO_PORT;
            delete process.env.MONGO_USER;
            delete process.env.MONGO_PASS;
            delete process.env.MONGO_DB;
        });
    });

    describe( 'no connection provided', function() {
        let db;
        it( 'should be able to connect with the default configuration', function() {
            db = require( '../src' )();
            return expect( db.connect()).to.eventually.be.fulfilled;
        });

        after( function() {
            return db.disconnect();
        });
    });

    describe( 'mongoose instance provided', function() {
        const db = require( '../src' )( mongoose );
        let connection;
        it( 'should create and resolve with a new connection', function() {
            return db.connect()
            .then(( res ) => {
                connection = res;
                expect( connection ).to.not.equal( mongoose.connection );
            });
        });

        after( function() {
            return db.disconnect( connection );
        });
    });

    describe( 'edge cases', function() {
        it( 'should reject on connect error', function() {
            const db = require( '../src' )( mongoose.connection, {
                host: 'invalid',
                port: 'invalid',
                user: 'invalid',
                pass: 'invalid',
                database: 'invalid',
            });
            return expect( db.connect()).to.be.rejected;
        });

        it( 'should reject on invalid connection', function() {
            const db = require( '../src' )({}, {
                host: 'invalid',
                port: 'invalid',
                user: 'invalid',
                pass: 'invalid',
                database: 'invalid',
            });
            return expect( db.connect()).to.be.rejected;
        });
    });
});

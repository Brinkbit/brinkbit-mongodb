'use strict';

const chai = require( 'chai' );
const chaiaspromised = require( 'chai-as-promised' );
const expect = chai.expect;
const mongoose = require( 'mongoose' );

chai.use( chaiaspromised );

describe( 'mongoose configuration', function() {
    describe( 'default test configuration', function() {
        const db = require( '../src' )( mongoose.connection );

        afterEach( function() {
            return db.disconnect();
        });

        it( 'should have the appropriate default configuration', function() {
            expect( db.config ).to.deep.equal({
                ip: 'localhost',
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
            process.env.MONGO_IP = 'testIp';
            process.env.MONGO_PORT = 'testPort';
            process.env.MONGO_USER = 'testUser';
            process.env.MONGO_PASS = 'testPassword';
            process.env.MONGO_DB = 'testDB';
            const db = require( '../src' )( mongoose.connection );
            expect( db.config ).to.deep.equal({
                ip: 'testIp',
                port: 'testPort',
                user: 'testUser',
                pass: 'testPassword',
                uri: 'mongodb://testUser:testPassword@testIp:testPort/testDB',
                database: 'testDB',
            });
        });
    });

    describe( 'manual configuration', function() {
        it( 'should have the appropriate configuration', function() {
            process.env.MONGO_IP = 'testIp';
            process.env.MONGO_PORT = 'testPort';
            process.env.MONGO_USER = 'testUser';
            process.env.MONGO_PASS = 'testPassword';
            process.env.MONGO_DB = 'testDB';
            const db = require( '../src' )( mongoose.connection, {
                ip: 'manualIp',
                port: 'manualPort',
                user: 'manualUser',
                pass: 'manualPassword',
                database: 'manualDB',
            });
            expect( db.config ).to.deep.equal({
                ip: 'manualIp',
                port: 'manualPort',
                user: 'manualUser',
                pass: 'manualPassword',
                uri: 'mongodb://manualUser:manualPassword@manualIp:manualPort/manualDB',
                database: 'manualDB',
            });
        });
    });

    describe( 'edge cases', function() {
        const db = require( '../src' )( mongoose.connection, {
            ip: 'invalid',
            port: 'invalid',
            user: 'invalid',
            pass: 'invalid',
            database: 'invalid',
        });

        it( 'should reject on connect error', function() {
            return expect( db.connect()).to.be.rejected;
        });
    });
});

'use strict';

const chai = require( 'chai' );
const chaiaspromised = require( 'chai-as-promised' );
const expect = chai.expect;
const db = require( '../index.js' );

chai.use( chaiaspromised );

it( 'should have the appropriate default configuration for testing', () => {
    expect( db.port ).to.equal( 3000 );
    expect( db.mongodb ).to.have.property( 'ip', 'localhost' );
    expect( db.mongodb ).to.have.property( 'port', '27017' );
    expect( db.mongodb ).to.have.property( 'uri', 'mongodb://localhost:27017/test' );
    expect( db.loginAttempts ).to.have.property( 'forIp', 50 );
    expect( db.loginAttempts ).to.have.property( 'forIpAndUser', 7 );
    expect( db.loginAttempts ).to.have.property( 'logExpiration', '20m' );
});

it( 'should resolve when it tries to disconnect without a connection', () => {
    expect( db.disconnect( )).to.eventually.resolve;
});

it( 'should be able to connect with the default configuration', () => {
    expect( db.connect( )).to.eventually.resolve;
});

it( 'should be able to disconnect after connection', () => {
    expect( db.disconnect( )).to.eventually.resolve;
});

it( 'should resolve if it is already connected', ( done ) => {
    db.connect()
    .then(() => {
        expect( db.connect( )).to.eventually.resolve;
    })
    .then( done );
});

it.skip( 'should handle environmental variables properly', () => {

});

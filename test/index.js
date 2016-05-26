'use strict';

const chai = require( 'chai' );
const chaiaspromised = require( 'chai-as-promised' );
const expect = chai.expect;
const mongoose = require( 'mongoose' );
const db = require( '../index.js' )( mongoose.connection );

chai.use( chaiaspromised );

it( 'should have the appropriate default configuration for testing', () => {
    expect( db.port ).to.equal( 3000 );
    expect( db.mongodb ).to.have.property( 'ip', 'localhost' );
    expect( db.mongodb ).to.have.property( 'port', '27017' );
    expect( db.mongodb ).to.have.property( 'uri', 'mongodb://localhost:27017/test' );
});

it( 'should resolve when it tries to disconnect without a connection', () => {
    return expect( db.disconnect( )).to.eventually.be.fulfilled;
});

it( 'should be able to connect with the default configuration', () => {
    return expect( db.connect( )).to.eventually.be.fulfilled;
});

it( 'should be able to disconnect after connection', () => {
    return expect( db.disconnect( )).to.eventually.be.fulfilled;
});

it( 'should resolve if it is already connected', ( done ) => {
    return db.connect()
    .then(() => {
        expect( db.connect( )).to.eventually.be.fulfilled;
    })
    .then( done );
});

it.skip( 'should handle environmental variables properly', () => {

});

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const config = require( '../index.js' );

describe( 'configuration options', function() {
    it( 'should have the appropriate default configuration for testing', () => {
        expect( config.port ).to.equal( 3000 );
        expect( config.mongodb ).to.have.property( 'ip', 'localhost' );
        expect( config.mongodb ).to.have.property( 'port', '27017' );
        expect( config.mongodb ).to.have.property( 'uri', 'mongodb://localhost:27017/test' );
        expect( config.loginAttempts ).to.have.property( 'forIp', 50 );
        expect( config.loginAttempts ).to.have.property( 'forIpAndUser', 7 );
        expect( config.loginAttempts ).to.have.property( 'logExpiration', '20m' );
    });

    it.skip( 'should handle environmental variables properly', () => {

    });
});

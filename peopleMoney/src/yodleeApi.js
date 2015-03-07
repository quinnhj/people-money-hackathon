"use strict";

var _               = require('underscore');
var request         = require('request');
var privateConfig          = require('./privateConfig.js');

// API Access constants for levelMoney
var cobUser = privateConfig.yodleeCobUser;
var cobPassword = privateConfig.yodleeCobPassword;
var API_URL = 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/';

//////////////////////////////////////////////////////////////////////////////
// Helper function to manage REST calls
//////////////////////////////////////////////////////////////////////////////

function sendApiRequest(apiName, args, cb) {
    //var fullArgs = {"args":{}};
    //_.extend(fullArgs, args);

    var options = {
        uri: API_URL + apiName,
        method: 'POST',
        //json: fullArgs
        json: args
    }

    request(options, function (error, response, body) {
        if (error) cb(error);
        cb(false, body);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Yodlee APIs
//
//////////////////////////////////////////////////////////////////////////////

function cobLogin(cb) {
    sendApiRequest('authenticate/coblogin', {'cobrandLogin': cobUser, 'cobrandPassword': cobPassword}, cb);
}

module.exports = {
    cobLogin: cobLogin
}


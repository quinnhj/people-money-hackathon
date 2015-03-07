"use strict";

var _               = require('underscore');
var request         = require('request');
var privateConfig          = require('./privateConfig.js');

// API Access constants for levelMoney
var cobUser = privateConfig.yodleeCobUser;
var cobPassword = privateConfig.yodleeCobPassword;
//var API_URL = 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/';
var API_URL = 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0';

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
        body: args.body,
        headers: {'content-type' : 'application/x-www-form-urlencoded'}
    }
    //console.log(options);

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
    var login = {
        cobrandLogin: cobUser,
        cobrandPassword: cobPassword,
        body: "cobrandLogin=sbCobwuda&cobrandPassword=e220ccfb-bfec-4136-ac4a-eba5bc46dfc5"
    };
    sendApiRequest('/authenticate/coblogin', login, cb);
}

module.exports = {
    cobLogin: cobLogin
};


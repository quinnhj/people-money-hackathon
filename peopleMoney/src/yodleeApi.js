"use strict";

var _               = require('underscore');
var request         = require('request');
var privateConfig          = require('./privateConfig.js');
//var jquery = require('jquery');

// API Access constants for levelMoney
var cobUser = privateConfig.yodleeCobUser;
var cobPassword = privateConfig.yodleeCobPassword;
//var API_URL = 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0/';
var API_URL = 'https://rest.developer.yodlee.com/services/srest/restserver/v1.0';

//////////////////////////////////////////////////////////////////////////////
// Helper function to manage REST calls
//////////////////////////////////////////////////////////////////////////////

function sendApiRequest(apiName, args, cb) {
    //console.log(jquery)
    var options = {
        url: API_URL + apiName,
        method: 'POST',
        //json: args,
        //body: encodeURIComponent(JSON.stringify(args)),
        //body: jsonToString(args),
        body: args,
        //json: true
        //headers: {'content-type' : 'application/x-www-form-urlencoded'}
    };
    console.log(options);
    //jquery.ajax(options).done(function(msg) { console.log(msg)});


    request(options, function (error, response, body) {
        if (error) cb(error);
        //console.log(cb);
        cb(false, body);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Yodlee APIs
//
//////////////////////////////////////////////////////////////////////////////

function jsonToString(obj) {
    var strings = [];
    _.each(_.keys(obj), function(key) {
        strings.push(key + '=' + obj[key]);
    });
    return strings.join('&');
}

// INTERNAL USE ONLY
function cobLogin(cb) {
    var login = {
        cobrandLogin: cobUser,
        cobrandPassword: cobPassword
        //body: "cobrandLogin=sbCobwuda&cobrandPassword=e220ccfb-bfec-4136-ac4a-eba5bc46dfc5"
    };
    sendApiRequest('/authenticate/coblogin', login, cb);
}

function consumerLogin(user, pass, cb) {
    cobLogin(function(err, cst) {
        console.log(cst)
        if (err) console.log(err);
        var b = jsonToString(cst)+'&login='+user+'&password='+pass;
        var login = {
            body: b,
            cobSessionToken: cst,
            login: user,
            password: pass
        };
        sendApiRequest('/authenticate/login', login, cb);
    });
}

module.exports = {
    cobLogin: cobLogin,
    consumerLogin: consumerLogin
};


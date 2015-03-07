"use strict";
var privateConfig = require('./privateConfig.js');

var request         = require('request');

// API Access constants for levelMoney
var KEY = privateConfig.nexmoKey;
var SECRET = privateConfig.nexmoSecret;

//////////////////////////////////////////////////////////////////////////////
// Helper function to manage REST calls
//////////////////////////////////////////////////////////////////////////////

function sendApiRequest(url, cb) {
    var options = {
        uri: url,
        method: 'GET',
    }

    request(options, function (error, response, body) {
        if (error) cb(error);
        cb(false, body);
    });
}

//////////////////////////////////////////////////////////////////////////////
// Nexmo API
//////////////////////////////////////////////////////////////////////////////

function sendMessage(args, cb) {
    sendApiRequest('https://rest.nexmo.com/sms/json?api_key='+KEY+'&api_secret='+SECRET+'&from='+args.from+'&to='+args.to+'&text='+args.text, cb)
}

module.exports = {
    sendMessage: sendMessage
}

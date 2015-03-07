"use strict";

var _               = require('underscore');
var request         = require('request');

// API Access constants for levelMoney
var UID = 1110568334;
var AUTH_TOKEN = 'D88517D61377232E3BACE8CA3EA15E7B';
var API_TOKEN = 'HackathonApiToken';
var API_URL = 'https://api.levelmoney.com/api/v2/hackathon/';


//////////////////////////////////////////////////////////////////////////////
// Helper function to manage REST calls
//////////////////////////////////////////////////////////////////////////////

function sendApiRequest(apiName, verify, args, cb) {
    //console.log(verify)
    var fullArgs = {"args": {"uid": verify.uid, "token": verify.authToken, "api-token": API_TOKEN}};
    _.extend(fullArgs, args);
    //console.log(fullArgs)

    var options = {
        uri: API_URL + apiName,
        method: 'POST',
        json: fullArgs
    }

    request(options, function (error, response, body) {
        if (error) cb(error);

        var hasError = (body.error.indexOf('no-error') === -1 &&
                     body.error.indexOf('NO_ERROR') === -1);
        if (hasError) {
            cb('API call returned error');
        } else {
            cb(false, body);
        }
    });
}

//////////////////////////////////////////////////////////////////////////////
// Core Capital One APIs
//
// These follow the standard node conventions of taking callbacks that
// take err as first arg and value as second arg.
//
//////////////////////////////////////////////////////////////////////////////

function getAccounts(uid, authToken, cb) {
    var verify = {
        'uid': uid,
        'authToken': authToken
    }
    sendApiRequest('get-accounts', verify, {}, cb);
}

// filter should be an array of two objects
function getAllTransactions(uid, authToken, cb, filter) {
    var verify = {
        'uid': uid,
        'authToken': authToken
    }
    sendApiRequest('get-all-transactions', verify, {}, function(err, val) {
        var transactions = val.transactions;
        if (filter) {
            var startDate = filter[0];
            var endDate = filter[1];
            var filtered = transactions.filter(function (el) {
                var tTime = Date.parse(el['transaction-time']);
                return tTime >= startDate &&
                tTime <= endDate;
            });
            cb(err, filtered);
        } else {
            cb(err, transactions);
        }
    });
}

function getProjectedTransactionsForMonth(uid, authToken, year, month, cb) {
    var verify = {
        'uid': uid,
        'authToken': authToken
    }
    sendApiRequest('projected-transactions-for-month', verify,
             {year: year, month: month}, cb);
}

function getRecentHistoricalAndProjectedBalances(uid, authToken, cb) {
    var verify = {
        'uid': uid,
        'authToken': authToken
    }
    sendApiRequest('balances', verify, {}, cb);
}

function findSimilarTransactions(uid, authToken, transactions, cb) {
    var verify = {
        'uid': uid,
        'authToken': authToken
    }
    sendApiRequest('find-similar-transactions', verify,
            {'transaction-ids': transactions}, cb);
}

module.exports = {
    getAccounts: getAccounts,
    getAllTransactions: getAllTransactions,
    getProjectedTransactionsForMonth: getProjectedTransactionsForMonth,
    getRecentHistoricalAndProjectedBalances: getRecentHistoricalAndProjectedBalances,
    findSimilarTransactions: findSimilarTransactions
}


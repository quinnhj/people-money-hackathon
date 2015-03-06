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

function sendApiRequest(apiName, args, cb) {
    var fullArgs = {"args": {"uid": UID, "token": AUTH_TOKEN, "api-token": API_TOKEN}};
    _.extend(fullArgs, args);

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

function getAccounts(cb) {
    sendApiRequest('get-accounts', {}, cb);
}

function getAllTransactions(cb) {
    sendApiRequest('get-all-transactions', {}, cb);
}

function getProjectedTransactionsForMonth(year, month, cb) {
    sendApiRequest('projected-transactions-for-month',
             {year: year, month: month}, cb);
}

function getRecentHistoricalAndProjectedBalances(cb) {
    sendApiRequest('balances', {}, cb);
}

function findSimilarTransactions(transactions, cb) {
    sendApiRequest('find-similar-transactions',
            {'transaction-ids': transactions}, cb);
}

module.exports = {
    getAccounts: getAccounts,
    getAllTransactions: getAllTransactions,
    getProjectedTransactionsForMonth: getProjectedTransactionsForMonth,
    getRecentHistoricalAndProjectedBalances: getRecentHistoricalAndProjectedBalances,
    findSimilarTransactions: findSimilarTransactions
}


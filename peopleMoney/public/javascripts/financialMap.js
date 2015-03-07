"use strict";

var d3          = require('d3');
var request     = require('request');

// Globals! Because hackathon!
var uid = 1110568334;
var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';
var svg;

// Fake financial data. Should be done with call to server.
// TODO: Get real data from REST calls.
var fakeData = {

    // Should have investments?
    accounts: [
        {
            name: 'Account 1',
            type: 'savings',
            balance: 1000
        }
    ],

    loans: [
        {
            name: 'Loan 1',
            type: 'credit',
            interestRate: 0.05,
            balance: 2000
        },
        {
            name: 'Loan 2',
            type: 'credit',
            interestRate: 0.035,
            balance: 100000
        },
    ],

    transactions: [
        {
            name: 'paycheck',
            type: 'income',
            amount: 2000
        },
        {
            name: 'paycheck',
            type: 'income',
            amount: 2000
        },
        {
            name: 'name1',
            category: 1,
            amount: -70
        },
        {
            name: 'name2',
            category: 1,
            amount: -40
        },
        {
            name: 'name2',
            category: 1,
            amount: -50
        },
        {
            name: 'name2',
            category: 1,
            amount: 2000
        },
        {
            name: 'name3',
            category: 2,
            amount: 2000
        },
        {
            name: 'name4',
            category: 2,
            amount: 2000
        },
        {
            name: 'name5',
            category: 2,
            amount: 2000
        },
        {
            name: 'name6',
            category: 3,
            amount: 2000
        }
    ]
};


function makeSvg() {
    svg = d3.select("#map-container").append("svg");
        // .attr("width", width)
        // .attr("height", height)
}

function getData(uid, authToken, cb) {
    var options = {
        uri: location.origin + '/getFinancialData?uid=' + uid + '&authToken=' + authToken,
        method: 'GET'
    }
    request(options, function (err, res, body) {
        if (err) cb(err);
        console.log('finished Req');
        cb(false, JSON.parse(body));
    });
}

function init () {
    console.log('Initializing Financial Map');
    makeSvg();

    var printCB = function(err, val) {
        if (err) console.log('Err: ', err);
        console.log('Val: ', val);
    }

    getData(uid, authToken, printCB);
}




module.exports = {
    init: init
}

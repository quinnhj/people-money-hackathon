"use strict";

var d3          = require('d3');
var request     = require('request');

// Globals! Because hackathon!
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
            type: 'loan',
            interestRate: 0.05,
            balance: 2000
        },
        {
            name: 'Loan 2',
            type: 'mortgage',
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
            type: 'expense',
            category: 1,
            amount: 2000
        },
        {
            name: 'name2',
            type: 'expense',
            category: 1,
            amount: 2000
        },
        {
            name: 'name2',
            type: 'expense',
            category: 1,
            amount: 2000
        },
        {
            name: 'name2',
            type: 'expense',
            category: 1,
            amount: 2000
        },
        {
            name: 'name3',
            type: 'expense',
            category: 2,
            amount: 2000
        },
        {
            name: 'name4',
            type: 'expense',
            category: 2,
            amount: 2000
        },
        {
            name: 'name5',
            type: 'expense',
            category: 2,
            amount: 2000
        },
        {
            name: 'name6',
            type: 'expense',
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

function getData(uid, cb) {
    var options = {
        uri: location.origin + '/getFinancialData?uid=' + uid,
        method: 'GET'
    }
    request(options, function (err, res, body) {
        if (err) cb(err);
        console.log('finished Req');
        cb(false, body);
    });
}

function init () {
    console.log('Initializing Financial Map');
    makeSvg();
}




module.exports = {
    init: init
}

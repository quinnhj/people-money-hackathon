"use strict";

var d3          = require('d3');
var request     = require('request');
var _           = require('underscore');

// Globals! Because hackathon!
var uid = 1110568334;
var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';

var svg;


var width = 1000,
    height = 1000;


function makeSvg() {
    svg = d3.select("#map-container").append("svg")
        .attr("width", width)
        .attr("height", height);
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

function formatData(data) {
    // Take raw data and fill nodes and links.
    // var nodes = [{
    //         name: 'user',
    //         type: 'user'
    // }];

    var nodes = [];
    // Links use indices in node list.
    var links = [];
    var accToIndex = {};


    _.each(data.accounts, function (account) {
        var newNode = _.extend(account, {
            name: account['account-name'],
            type: account['account-type'],
            id: account['account-id']
        });

        accToIndex[account['account-id']] = nodes.length;
        nodes.push(newNode);
    });

    _.each(data.transactions, function (t) {
        var newNode = {
            name: t['raw-merchant'],
            merchant: t.merchant,
            type: 'transaction',
            category: t.categorization,
        };

        var newLink = {
            src: accToIndex[t['account-id']],
            dst: nodes.length,
            id: t['transaction-id'],
            time: t['transaction-time'],
            isPending: t['is-pending'],
            val: t.ammount * (-0.01) // Convert to outflow in cents
        }

        nodes.push(newNode);
        links.push(newLink);
    });

    return {nodes: nodes, links: links};
}

function init () {
    console.log('Initializing Financial Map');
    makeSvg();
    getData(uid, authToken, function (err, finData) {
        if (err) {
            console.log('ERROR: ', err);
            return;
        }

        console.log('finData: ', finData);

        var formattedData = formatData(finData);
        console.log('formattedData: ', formattedData);

    });
}




module.exports = {
    init: init
}

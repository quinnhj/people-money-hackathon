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
    var accToIndex = {}; // Get index of an account by ID
    var categoryLookup = {};

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
        // Node / link for transaction endpoint.
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
            val: t.amount * (-0.01) // Convert to outflow in cents
        }

        nodes.push(newNode);
        // Uncomment if you want to have direct links from
        // account to vendor without category in between.
        // links.push(newLink);

        // Create Node / links for categories

        if (!categoryLookup.hasOwnProperty(newNode.category)) {
            // First time we saw this category
            // Make node for category

            var newCategoryNode = {
                name: newNode.category,
                type: 'category'
            };

            // To category
            var newCategoryLink1 = {
                src: newLink.src,
                dst: nodes.length, // category
                val: newLink.val
            };

            // From category to vendor
            var newCategoryLink2 = {
                src: nodes.length,
                dst: newLink.dst,
                id: newLink.id,
                time: newLink.time,
                isPending: newLink.isPending,
                val: newLink.val
            };

            categoryLookup[newNode.category] = {
                inLink: newCategoryLink1,
                index: nodes.length
            };

            nodes.push(newCategoryNode);
            links.push(newCategoryLink1);
            links.push(newCategoryLink2);

        } else {
            // We've seen it before, just make a link and update values.

            var categoryInLink = categoryLookup[newNode.category].inLink;
            var categoryIndex = categoryLookup[newNode.category].index;
            categoryInLink.val += newLink.val;

            // From category to vendor
            var newCategoryLink2 = {
                src: categoryIndex,
                dst: newLink.dst,
                id: newLink.id,
                time: newLink.time,
                isPending: newLink.isPending,
                val: newLink.val
            };
            links.push(newCategoryLink2);
        }

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

"use strict";

var d3          = require('d3');
var request     = require('request');

function makeSvg() {
    var svg = d3.select("#map-container").append("svg");
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
    getData('ID', function (err, data) {
        if (err) {
            console.log('Error: ', err);
            return;
        }
        console.log('Got Data: ', data);
    });
}




module.exports = {
    init: init
}

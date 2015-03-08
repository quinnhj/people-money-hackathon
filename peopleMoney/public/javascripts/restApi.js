"use strict";

var request     = require('request');

function getGoals(uid, authToken, cb) {
    var options = {
        uri: location.origin + '/getGoals?uid=' + uid + '&authToken=' + authToken,
        method: 'GET'
    };
    request(options, function (err, res, body) {
        if (err) cb(err);
        cb(false, JSON.parse(body));
    });
}


function setGoal(uid, authToken, merchant, percentage, category, cb) {
    var options = {
        uri: location.origin + '/setGoal?uid=' + uid + '&authToken=' + authToken
                + '&merchant=' + encodeURIComponent(merchant) + '&percentage=' + percentage + '&category=' + encodeURIComponent(category),
        method: 'GET'
    };
    request(options, function (err, res, body) {
        if (err) cb(err);
        cb(false, JSON.parse(body));
    });
}


function getData(uid, authToken, cb) {
    var options = {
        uri: location.origin + '/getFinancialData?uid=' + uid + '&authToken=' + authToken,
        method: 'GET'
    }
    request(options, function (err, res, body) {
        if (err) cb(err);
        cb(false, JSON.parse(body));
    });
}

module.exports = {
    getGoals: getGoals,
    setGoal: setGoal,
    getData: getData
};

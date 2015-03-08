"use-strict";

var capitalApi = require('./capitalApi.js');
var _ = require('underscore');

// Returns Debt / Balance as a float
function getDebtBalanceRatio(uid, authToken, cb) {
    capitalApi.getAccounts(uid, authToken, function(err, val) {
        var debt = 0.0;
        var balance = 0.0;
        _.each(val.accounts, function(el) {
            if(el.balance < 0.0) {
                debt += el.balance;
            } else {
                balance += el.balance;
            }
        });
        var ratio = Math.abs(debt / balance);
        cb(err, ratio);
    });
}

// Returns total debt across all accounts - absolute value
function getTotalDebt(uid, authToken, cb) {
    capitalApi.getAccounts(uid, authToken, function(err, val) {
        var debt = 0.0;
        _.each(val.accounts, function(el) {
            if(el.balance < 0.0) {
                debt += el.balance;
            }
        });
        cb(err, Math.abs(debt))
    });
}

// Returns total balances across accounts (excludes debt)
function getTotalBalance(uid, authToken, cb) {
    capitalApi.getAccounts(uid, authToken, function(err, val) {
        var balance = 0.0;
        _.each(val.accounts, function(el) {
            if(el.balance > 0.0) {
                balance += el.balance;
            }
        });
        cb(err, balance)
    });
}

// Returns net worth of the user
function getNetWorth(uid, authToken, cb) {
    capitalApi.getAccounts(uid, authToken, function(err, val) {
        var net = 0.0;
        _.each(val.accounts, function(el) {
            net += el.balance;
        });
        cb(err, net)
    });
}

// Returns total deposits across date range. Use Date.parse() for start/end dates
// Ex. healthApi.getDeposits(1234, abc, Date.parse(Date(2015, 1, 1, 0, 0, 0)), Date.now(), cb);
function getDeposits(uid, authToken, startDate, endDate, cb) {
    var f = function(err, transactions) {
        var total = 0.0;
        _.each(transactions, function(el) {
            var amount = el.amount;
            if(amount > 0.0) {
                total += amount;
            }
        });
        cb(err, total)
    }
    capitalApi.getAllTransactions(uid, authToken, f, [startDate, endDate]);

}
//total debt
//total balance
//income
//expenses

module.exports = {
    getDebtBalanceRatio: getDebtBalanceRatio,
    getTotalDebt: getTotalDebt,
    getTotalBalance: getTotalBalance,
    getNetWorth: getNetWorth,
    getDeposits: getDeposits
}

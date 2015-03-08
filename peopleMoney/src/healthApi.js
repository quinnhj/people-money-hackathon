"use-strict";

var capitalApi = require('./capitalApi.js');
var _ = require('underscore');

///////////////////////////////////////////////////////////////////////
// Helper functions used to calculate financial health of individual
//
// Note: All amounts (except ratios) are returned in centocents
///////////////////////////////////////////////////////////////////////

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
        cb(err, total);
    }
    capitalApi.getAllTransactions(uid, authToken, f, [startDate, endDate]);
}

// Returns absolute value of total expenses across date range. Use Date.parse() for start/end dates
// Ex. healthApi.getExpenses(1234, abc, Date.parse(Date(2015, 1, 1, 0, 0, 0)), Date.now(), cb);
function getExpenses(uid, authToken, startDate, endDate, cb) {
    var f = function(err, transactions) {
        var total = 0.0;
        _.each(transactions, function(el) {
            var amount = el.amount;
            if(amount < 0.0) {
                total += amount;
            }
        });
        cb(err, Math.abs(total));
    }
    capitalApi.getAllTransactions(uid, authToken, f, [startDate, endDate]);
}

// Returns net spending (deposits - expenses) across date range. Use Date.parse() for start/end dates
// Ex. healthApi.getNetSpending(1234, abc, Date.parse(Date(2015, 1, 1, 0, 0, 0)), Date.now(), cb);
function getNetSpending(uid, authToken, startDate, endDate, cb) {
    var f = function(err, transactions) {
        var total = 0.0;
        _.each(transactions, function(el) {
            var amount = el.amount;
            total += amount;
        });
        cb(err, total);
    }
    capitalApi.getAllTransactions(uid, authToken, f, [startDate, endDate]);
}

// Returns last year's savings (deposits - expenses) as tuple [dates, values]
// values returned in dollars
function getLastYearSavings(uid, authToken, cb) {
    var f = function(err, transactions) {
        var dates = [new Date(Date.now())];
        var values = [];
        for (i = 0; i < 12; i++) {
            var newDate = new Date(dates[0]).setMonth(dates[0].getMonth() - i);
            dates.push(new Date(newDate));
        }
        for (i = 0; i < dates.length-1; i++) {
            var end = dates[i];
            var start = dates[i+1];
            var total = 0.0;
            _.each(transactions, function(el) {
                var amount = el.amount;
                var date = new Date(el['transaction-time']);
                if (start <= date && end >= date) {
                    total += amount;
                }
            });
            values.push(total);
        }
        var dollarValues = _.map(values, function(el) {
            return (el / 10000.0).toFixed(2);
        });
        dates.shift();
        cb(err, [dates, dollarValues]);
    }
    capitalApi.getAllTransactions(uid, authToken, f)
}

module.exports = {
    getDebtBalanceRatio: getDebtBalanceRatio,
    getTotalDebt: getTotalDebt,
    getTotalBalance: getTotalBalance,
    getNetWorth: getNetWorth,
    getDeposits: getDeposits,
    getExpenses: getExpenses,
    getNetSpending: getNetSpending,
    getLastYearSavings: getLastYearSavings
}

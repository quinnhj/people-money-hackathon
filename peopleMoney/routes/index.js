
var privateConfig = require('../src/privateConfig.js');
var express = require('express');
var capitalApi = require('../src/capitalApi.js');
var nexmoApi = require('../src/nexmoApi.js');
var yodleeApi = require('../src/yodleeApi.js');
var healthApi = require('../src/healthApi.js');
var plotly = require('plotly')(privateConfig.plotlyUser, privateConfig.plotlyPass);
var _ = require('underscore');
var fs = require('fs');

var router = express.Router();

// For testing
var printCB = function (err, val) {
    if (err) {
        console.log('Error: ', err);
    } else {
        console.log('Value: ', val);
    }
}


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/hello', function(req, res, next) {
    var uid = 1110570166;
    var authToken = '63C08C4AA6E3CB1A4B13C9C5299365C0';
    // Capital one API Test
    //capitalApi.getAllTransactions(uid, authToken, printCB);
    //capitalApi.getAllTransactions(uid, authToken, printCB, [new Date(2015, 0, 1, 0, 0, 0, 0), new Date(Date.now())]);
    //capitalApi.getAccounts(uid, authToken, printCB);
    //capitalApi.getRecentHistoricalAndProjectedBalances(uid, authToken, printCB)

    // Nexmo API Test
    //nexmoTest = {
    //    to: privateConfig.testNumber,
    //    from: '12036639233',
    //    text: 'Welcome+to+Nexmo'
    //};
    //nexmoApi.sendMessage(nexmoTest, printCB);

    // Yodlee API Test
    //var user = 'sbMemwuda1';
    //var pass = 'sbMemwuda1#123';
    //yodleeApi.consumerLogin(user, pass, printCB);
    //yodleeApi.cobLogin(printCB);

    // Health API Test
    //healthApi.getDebtBalanceRatio(uid, authToken, printCB);
    //healthApi.getTotalDebt(uid, authToken, printCB);
    //healthApi.getTotalBalance(uid, authToken, printCB);
    //healthApi.getNetWorth(uid, authToken, printCB);
    //healthApi.getDeposits(uid, authToken, new Date(2015, 0, 1, 0, 0, 0, 0), new Date(Date.now()), printCB);
    //healthApi.getExpenses(uid, authToken, new Date(2015, 0, 1, 0, 0, 0, 0), new Date(Date.now()), printCB);
    //healthApi.getNetSpending(uid, authToken, new Date(2015, 0, 1, 0, 0, 0, 0), new Date(Date.now()), printCB);
    //healthApi.getLastYearSavings(uid, authToken, printCB);
    healthApi.getYearHealthScore(uid, authToken, printCB);

    res.render('hello', { title: 'HelloWorld' });
});

router.get('/dashboard', function(req, res, next) {
    var uid = 1110570166;
    var authToken = '63C08C4AA6E3CB1A4B13C9C5299365C0';
    healthApi.getYearHealthScore(uid, authToken, function(err, arr) {
        var months = arr[0];
        var scores = arr[1];
        var letterScores = _.map(scores, function(el) {
            if (el >= 90 && el <= 100) return 'A';
            else if (el < 90 && el >= 80) return 'B';
            else if (el < 80 && el >= 70) return 'C';
            else if (el < 70 && el >= 60) return 'D';
            else return 'F';
        });
        var data = [
          {
            x: months,
            y: scores,
            text: letterScores,
            type: "scatter",
          }
        ];
        var layout = {
            title: "Your Financial Health",
            titlefont: {
                family: "Courier New, monospace",
                size: 24
            },
            xaxis:  {
                title: "Date",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                }
            },
            yaxis:  {
                title: "Score",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                }
            },
            annotations: [
                {
                    x: data[0].x[0],
                    y: data[0].y[0],
                    xref: "x",
                    yref: "y",
                    text: "Current Score: "+data[0].text[data[0].text.length-1],
                    showarrow: true,
                    font: {
                        family: "Courier New, monospace",
                        size: 16,
                        color: "#ffffff"
                    },
                    align: "center",
                    arrowhead: 2,
                    arrowsize: 1,
                    arrowwidth: 2,
                    arrowcolor: "#636363",
                    ax: 20,
                    ay: -30,
                    bordercolor: "#c7c7c7",
                    borderwidth: 2,
                    borderpad: 4,
                    bgcolor: "#ff7f0e",
                    opacity: 0.8
                }
            ]
        };
        var graphOptions = {layout: layout, filename: "date-axes", fileopt: "overwrite"};
        plotly.plot(data, graphOptions, function (err, msg) {
            res.render('dashboard', {healthPlotUrl: msg.url+'.embed?width=640&height=480'});
        });
    });
});

router.get('/map', function(req, res, next) {
    res.render('map', {});
});

router.get('/goals', function(req, res, next) {
    res.render('goals', {});
});

router.get('/details', function(req, res, next) {
    var uid = 1110570166;
    var authToken = '63C08C4AA6E3CB1A4B13C9C5299365C0';
    healthApi.getLastYearSavings(uid, authToken, function(err, arr) {
        if (err) res.send({error: 'error'});
        var months = arr[0];
        var values = arr[1];
        var data = [
            {
                x: months,
                y: values,
                type: "scatter"
            }
        ];
        var layout = {
            title: "Monthly Savings",
            titlefont: {
                family: "Courier New, monospace",
                size: 24
            },
            xaxis:  {
                title: "Date",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                }
            },
            yaxis:  {
                title: "Dollars",
                titlefont: {
                    family: "Courier New, monospace",
                    size: 18,
                    color: "#7f7f7f"
                }
            }
        }
        var graphOptions = {layout: layout, filename: "date-axes", fileopt: "overwrite"};
        plotly.plot(data, graphOptions, function(err, msg) {
            res.render('details', {savingsGraphUrl: msg.url+'.embed?width=640&height=480'});
        });
    });
});

router.get('/settings', function(req, res, next) {
    res.render('settings', {});
});

router.get('/getFinancialData', function(req, res, next) {

    var uid = parseInt(req.query.uid);
    var authToken = req.query.authToken;

    if (!uid || !authToken) {
        res.send({error: 'Invalid uid or authToken'});
        return;
    }

    var payload = {error: null};
    capitalApi.getAllTransactions(uid, authToken, function(err, transactions) {
        if (err) res.send({error: 'Error'});
        payload.transactions = transactions;
        capitalApi.getAccounts(uid, authToken, function(err, data){
            if (err) res.send({error: 'Error'});
            payload.accounts = data.accounts;
            res.send(payload);
        });
    });

});

router.get('/getGoals', function(req, res, next) {
    var file = './src/goals.json';
    var uid = parseInt(req.query.uid);
    var authToken = req.query.authToken;

    if (!uid || !authToken) {
        res.send({error: 'Invalid uid or authToken'});
        return;
    }
    var payload = {error: null};

    var data = fs.readFileSync(file, {encoding: 'utf8'});
    var json = JSON.parse(data);
    if (!json[uid]) {
        json[uid] = [];
    }
    var goalList = json[uid];
    payload.goalList = goalList;
    res.send(payload);
});

router.get('/setGoal', function(req, res, next) {
    var file = './src/goals.json';
    var uid = parseInt(req.query.uid);
    var authToken = req.query.authToken;
    var merchant = req.query.merchant;
    var percentage = req.query.percentage;
    var category = req.query.category;

    if (!uid || !authToken) {
        res.send({error: 'Invalid uid or authToken'});
        return;
    }
    var payload = {error: null};
    var data = fs.readFileSync(file, {encoding: 'utf8'});
    var obj = JSON.parse(data);
    if (!obj[uid]) {
        obj[uid] = [];
    }
    var newGoal = {
        'merchant': merchant,
        'percentage': percentage,
        'category': category
    };
    obj[uid].push(newGoal);
    fs.writeFileSync(file, JSON.stringify(obj, null, 4));
    payload.complete = true;
    res.send(payload);
});

module.exports = router;

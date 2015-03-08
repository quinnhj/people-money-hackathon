
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
    var uid = 1110568334;
    var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';
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
    var uid = 1110568334;
    var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';
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
        // Goals Calculations Here
        var transactions = arr[2];
        var file = './src/goals.json';
        var filedata = fs.readFileSync(file, {encoding: 'utf8'});
        var obj = JSON.parse(filedata);
        if (!obj[uid]) {
            obj[uid] = [];
        }
        var goalList = obj[uid];
        var goalsRender = [];
        console.log('goalList', goalList);
        for (i = 0; i < goalList.length; i++) {
            if (i === 3) break;
            var newObj = {}
            newObj.goal = goalList[i];
            var curr = 0.0;
            var prev = 0.0;
            var currDate = new Date(Date.now());
            var tmp = new Date(Date.now());
            var lastDate = new Date(tmp.setMonth(tmp.getMonth() - 1));
            var last2Date = new Date(tmp.setMonth(tmp.getMonth() - 2));
            _.each(transactions, function(el) {
                var tTime = new Date(el['transaction-time']);
                if (el['merchant'].toLowerCase() === goalList[i].merchant.toLowerCase()) {
                    if( tTime >= lastDate && tTime <= currDate) {
                        curr += el.amount;
                    } else if (tTime >= last2Date && tTime < lastDate) {
                        prev += el.amount;
                    }
                }
            });
            var percentChange = ((curr - prev) / prev) * 100;
            if (curr === 0 && prev === 0) {
                percentChange = 0;
            }
            if ((percentChange > 0 && goalList[i].percentage > 0) || (percentChange <= 0 && goalList[i].percentage <= 0)) {
                percentChange = Math.abs(percentChange);
            } else {
                percentChange = -1 * Math.abs(percentChange);
            }
            newObj.percentChange = Math.round(percentChange);
            goalsRender.push(newObj);
        }
        console.log(goalsRender);
        plotly.plot(data, graphOptions, function (err, msg) {
            res.render('dashboard', {healthPlotUrl: msg.url+'.embed?width=400&height=400', goals: goalsRender});
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
    var uid = 1110568334;
    var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';
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
    var progress = req.query.progress;

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
    var goalList = obj[uid];
    payload.goalList = goalList;
    if (progress) {
        capitalApi.getAllTransactions(uid, authToken, function(err, transactions) {
            if (err) res.send({error: 'Error'});
            var progressMap = {};
            var curr = 0.0;
            var prev = 0.0;
            var currDate = new Date(Date.now());
            var tmp = new Date(Date.now());
            var lastDate = new Date(tmp.setMonth(tmp.getMonth() - 1));
            var last2Date = new Date(tmp.setMonth(tmp.getMonth() - 2));
            for (i = 0; i < goalList.length; i++) {
                _.each(transactions, function(el) {

                    var tTime = new Date(el['transaction-time']);
                    if (el['merchant'].toLowerCase() === goalList[i].merchant.toLowerCase()) {
                        if( tTime >= lastDate && tTime <= currDate) {
                            curr += el.amount;
                        } else if (tTime >= last2Date && tTime < lastDate) {
                            prev += el.amount;
                        }
                    }
                });
                var percentChange = ((curr - prev) / prev) * 100;
                if (curr === 0 && prev === 0) {
                    percentChange = 0;
                }
                if ((percentChange > 0 && goalList[i].percentage > 0) || (percentChange <= 0 && goalList[i].percentage <= 0)) {
                    percentChange = Math.abs(percentChange);
                } else {
                    percentChange = -1 * Math.abs(percentChange);
                }
                progressMap[goalList[i].merchant.toLowerCase()] = Math.round(percentChange);
            }
            payload.progress = progressMap;
            res.send(payload);
        });
    } else {
        res.send(payload);
    }
});

router.get('/setGoal', function(req, res, next) {
    var file = './src/goals.json';
    var uid = parseInt(req.query.uid);
    var authToken = req.query.authToken;
    var merchant = req.query.merchant.toLowerCase();
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

router.get('/sendReminder', function(req, res, next) {
    var file = './src/goals.json';
    var uid = parseInt(req.query.uid);
    var authToken = req.query.authToken;
    var index = req.query.index;
    var to = parseInt(req.query.to);
    var from = parseInt(req.query.from);
    var payload = {error: null};

    var data = fs.readFileSync(file, {encoding: 'utf8'});
    var obj = JSON.parse(data);
    var goal = obj[uid][index];
    console.log('obj[uid]', obj[uid]);
    console.log('goal', goal);

    var verb = (goal.percentage > 0.0) ? "increase" : "decrease";
    var text = "Don't forget about your goal to "+verb+" spending by "+Math.abs(goal.percentage).toString()+" percent at "+goal.merchant+"!";
    var args = {
        "to": to,
        "from": from,
        "text": text
    };
    nexmoApi.sendMessage(args, function(err, cb) {
        if (err) res.send({error: 'Error'});
        payload.complete = true;
        res.send(payload);
    });

});

module.exports = router;

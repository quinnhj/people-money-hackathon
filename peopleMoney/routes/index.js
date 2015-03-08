
var privateConfig = require('../src/privateConfig.js');
var express = require('express');
var capitalApi = require('../src/capitalApi.js');
var nexmoApi = require('../src/nexmoApi.js');
var yodleeApi = require('../src/yodleeApi.js');
var healthApi = require('../src/healthApi.js');

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

    res.render('hello', { title: 'HelloWorld' });
});

router.get('/dashboard', function(req, res, next) {
    res.render('dashboard', {});
});

router.get('/map', function(req, res, next) {
    res.render('map', {});
});

router.get('/goals', function(req, res, next) {
    res.render('goals', {});
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


module.exports = router;

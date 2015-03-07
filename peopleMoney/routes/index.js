
var privateConfig = require('../src/privateConfig.js');
var express = require('express');
var capitalApi = require('../src/capitalApi.js');
var nexmoApi = require('../src/nexmoApi.js');
var yodleeApi = require('../src/yodleeApi.js');

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
    // Capital one API Test
    var uid = 1110570166;
    var authToken = '63C08C4AA6E3CB1A4B13C9C5299365C0';
    //capitalApi.getAllTransactions(uid, authToken, printCB);
    capitalApi.getAllTransactions(uid, authToken, printCB, [Date.parse('2015-01-01T00:00:00.000Z'), Date.parse('2015-03-07T00:00:00.000Z')]);
    //capitalApi.getAccounts(uid, authToken, printCB);

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
    capitalApi.getAllTransactions(uid, authToken, function(err, data) {
        if (err) res.send({error: 'Error'});
        payload.transactions = data.transactions;
        capitalApi.getAccounts(uid, authToken, function(err, data){
            if (err) res.send({error: 'Error'});
            payload.accounts = data.accounts;
            res.send(payload);
        });
    });

});


module.exports = router;

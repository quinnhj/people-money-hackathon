
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
    //capitalApi.getAllTransactions(printCB);

    // Nexmo API Test
    nexmoTest = {
        to: privateConfig.testNumber,
        from: '12036639233',
        text: 'Welcome+to+Nexmo'
    };
    nexmoApi.sendMessage(nexmoTest, printCB);

    // Yodlee API Test
    yodleeApi.cobLogin(printCB);

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
    // TODO: Actually return real data
    console.log('Got request for financial data from uid: ', req.query.uid);
    var fakeObj = {fake: 'fake'};
    res.send(fakeObj);
});


module.exports = router;

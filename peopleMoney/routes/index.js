
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
    //nexmoTest = {
    //    to: '18647040585',
    //    from: '12036639233',
    //    text: 'Welcome+to+Nexmo'
    //};
    //nexmoApi.sendMessage(nexmoTest, printCB);

    // Yodlee API Test
    yodleeApi.cobLogin(printCB);

    res.render('hello', { title: 'HelloWorld' });
});




module.exports = router;

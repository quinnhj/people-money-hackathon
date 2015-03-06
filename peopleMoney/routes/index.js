
var express = require('express');
var capitalApi = require('../src/capitalApi.js');

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
    // capitalApi.getAllTransactions(printCB);
    res.render('hello', { title: 'HelloWorld' });
});




module.exports = router;

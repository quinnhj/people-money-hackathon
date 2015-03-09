"use strict";

var financialMap = require('./financialMap.js');


// Handler to make sure bootstrap nav bars show current page.
var url = window.location.href;
$('.navbar-nav > li').removeClass('active');
var tab = 'dashboard';
if (url.indexOf('map') > -1) {
    tab = 'map';
} else if (url.indexOf('goal') > -1) {
    tab = 'goals';
} else if (url.indexOf('settings') > -1) {
    tab = 'settings';
} else if (url.indexOf('details') > -1) {
    tab = 'details';
}
$('#' + tab + '-tab').addClass('active');


// Init code based on current tab.
if (tab === 'map') {
    financialMap.init();
}


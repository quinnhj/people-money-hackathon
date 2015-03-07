"use strict";

// Handler to make sure bootstrap nav bars show current page.
var url = window.location.href;
$('.navbar-nav > li').removeClass('active');
var tabId = '#dashboard-tab';
if (url.indexOf('map') > -1) {
    tabId = '#map-tab';
} else if (url.indexOf('goal') > -1) {
    tabId = '#goals-tab';
} else if (url.indexOf('settings') > -1) {
    tabId = '#settings-tab';
}
$(tabId).addClass('active');


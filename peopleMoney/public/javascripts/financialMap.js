"use strict";

var d3          = require('d3');
var request     = require('request');
var _           = require('underscore');

// Globals! Because hackathon!
var uid = 1110568334;
var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';

var svg;


var width = $('#map-container').width(),
    height = 600;


function makeSvg() {
    svg = d3.select("#map-container").append("svg")
        .attr("width", width)
        .attr("height", height);
}

function getData(uid, authToken, cb) {
    var options = {
        uri: location.origin + '/getFinancialData?uid=' + uid + '&authToken=' + authToken,
        method: 'GET'
    }
    request(options, function (err, res, body) {
        if (err) cb(err);
        console.log('finished Req');
        cb(false, JSON.parse(body));
    });
}

function formatData(data) {
    // Take raw data and fill nodes and links.
    // var nodes = [{
    //         name: 'user',
    //         type: 'user'
    // }];

    var nodes = [];
    // Links use indices in node list.
    var links = [];
    var accToIndex = {}; // Get index of an account by ID
    var categoryLookup = {};

    _.each(data.accounts, function (account) {
        var newNode = _.extend(account, {
            name: account['account-name'],
            type: account['account-type'],
            id: account['account-id']
        });

        accToIndex[account['account-id']] = nodes.length;
        nodes.push(newNode);
    });

    _.each(data.transactions, function (t, idx) {
        if (idx > 20) return; // Hack to keep it small

        // Node / link for transaction endpoint.
        var newNode = {
            name: t['raw-merchant'],
            merchant: t.merchant,
            type: 'transaction',
            category: t.categorization,
        };

        var newLink = {
            source: accToIndex[t['account-id']],
            target: nodes.length,
            id: t['transaction-id'],
            time: t['transaction-time'],
            isPending: t['is-pending'],
            value: t.amount * (-0.01) // Convert to outflow in cents
        }

        nodes.push(newNode);
        // Uncomment if you want to have direct links from
        // account to vendor without category in between.
        // links.push(newLink);

        // Create Node / links for categories

        if (!categoryLookup.hasOwnProperty(newNode.category)) {
            // First time we saw this category
            // Make node for category

            var newCategoryNode = {
                name: newNode.category,
                type: 'category'
            };

            // To category
            var newCategoryLink1 = {
                source: newLink.source,
                target: nodes.length, // category
                value: newLink.value
            };

            // From category to vendor
            var newCategoryLink2 = {
                source: nodes.length,
                target: newLink.target,
                id: newLink.id,
                time: newLink.time,
                isPending: newLink.isPending,
                value: newLink.value
            };

            categoryLookup[newNode.category] = {
                inLink: newCategoryLink1,
                index: nodes.length
            };

            nodes.push(newCategoryNode);
            links.push(newCategoryLink1);
            links.push(newCategoryLink2);

        } else {
            // We've seen it before, just make a link and update values.

            var categoryInLink = categoryLookup[newNode.category].inLink;
            var categoryIndex = categoryLookup[newNode.category].index;
            categoryInLink.value += newLink.value;

            // From category to vendor
            var newCategoryLink2 = {
                source: categoryIndex,
                target: newLink.target,
                id: newLink.id,
                time: newLink.time,
                isPending: newLink.isPending,
                value: newLink.value
            };
            links.push(newCategoryLink2);
        }

    });

    return {nodes: nodes, links: links};
}


function createViz (data) {

    // SVG already exists. TODO: Why?

    // Add the graph group as a child of the main svg
    var margin = 10;
    var graphWidth = width - margin*2;
    var graphHeight = height - margin*2;
    var graph = svg
        .append("g")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", "translate(" + margin + "," + margin + ")");
    var formatLabel = _.identity; // TODO: remove?
    var formatTooltip = function (d) {
        return d.name;
    }

    // TODO: Play with settings
    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([graphWidth, graphHeight]);

    var path = sankey.link();
    sankey.nodes(data.nodes)
        .links(data.links)
        .layout(1);
    var link = graph.append("g").selectAll(".link")
        .data(data.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
            return b.dy - a.dy;
        });
    link.append("title")
        .text(formatTooltip);
    var node = graph.append("g").selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    var color = d3.scale.category20();
    // Draw the rectangles at each end of the link that
    // correspond to a given node, and then decorate the chart
    // with the names for each node.
    node.append("rect")
        .attr("height", function(d) {
            return Math.max(d.dy,1);
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
            d.color = color(d.name.replace(/ .*/, ""));
            return d.color;
        })
        .style("stroke", function(d) {
            return d3.rgb(d.color).darker(2);
        })
        .on("mouseover", function(node) {
            var linksToHighlight = link.filter(function(d) {
                return d.source.name === node.name || d.target.name === node.name;
            });
            linksToHighlight.classed('hovering', true);
        })
        .on("mouseout", function(node) {
            var linksToHighlight = link.filter(function(d) {
                return d.source.name === node.name || d.target.name === node.name;
            });
            linksToHighlight.classed('hovering', false);
        })
        .append("title")
        .text(function(d) {
            return formatLabel(d.name) + "\n" + d.value;
        });
    node.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
    })
        .call(d3.behavior.drag()
            .origin(function(d) {
                return d;
            })
            .on("dragstart", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
            return formatLabel(d.name);
        })
        .filter(function(d) {
            return d.x < graphWidth / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

    function dragmove(d) {
        d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(graphHeight - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
    }
}



function init () {
    console.log('Initializing Financial Map');
    makeSvg();
    getData(uid, authToken, function (err, finData) {
        if (err) {
            console.log('ERROR: ', err);
            return;
        }

        console.log('finData: ', finData);
        console.log('D3: ', d3);

        var formattedData = formatData(finData);
        console.log('formattedData: ', formattedData);
        createViz(formattedData);

    });
}




module.exports = {
    init: init
}

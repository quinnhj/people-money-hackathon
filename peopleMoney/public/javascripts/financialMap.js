"use strict";

var d3          = require('d3');
var request     = require('request');
var _           = require('underscore');

// Globals! Because hackathon!
var uid = 1110568334;
var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';

var svg;
var numCategories = 0;
var numTransactions = 0;

var width = $('#map-container').width(),
    height = 1000,
    margin = 15;


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


function formatDataTree(data) {

    var accToIndex = {}; // Get index of an account by ID
    var categoryLookup = {};

    var root = {
        name: 'user',
        type: 'user',
        categories: [],
        accounts: []
    }

    // Create account nodes
    _.each(data.accounts, function (account) {
        var newNode = _.extend(account, {
            name: account['account-name'],
            type: 'account',
            accountType: account['account-type'],
            id: account['account-id']
        });

        accToIndex[account['account-id']] = root.accounts.length;
        root.accounts.push(newNode);
    });


    // Create category nodes and get sum of inflow to categories.
    _.each(data.transactions, function (t,idx) {
        // if (idx > 20) return; // Hack to keep it small

        if (!categoryLookup.hasOwnProperty(t.categorization)) {
            // First time we saw this category
            // Make node for category
            numCategories += 1;

            var newCategoryNode = {
                name: t.categorization,
                type: 'category',
                children: [],
                val: t.amount * (-0.01) // Convert to outflow in cents
            };

            categoryLookup[t.categorization] = {
                node: newCategoryNode,
                index: root.categories.length
            };
            root.categories.push(newCategoryNode);
        } else {
            // We've seen it before, just make a link and update values.
            var node = categoryLookup[t.categorization].node;
            node.val += t.amount * (-0.01); // Convert to outflow in cents
        }
    });


    //
    // TODO: Sort categories and update categoryLookup
    //


    _.each(data.transactions, function (t, idx) {
        // if (idx > 20) return; // Hack to keep it small

        numTransactions += 1;

        // Node / link for transaction endpoint.
        var newNode = {
            name: t['raw-merchant'],
            merchant: t.merchant,
            type: 'transaction',
            category: t.categorization,
            id: t['transaction-id'],
            time: t['transaction-time'],
            isPending: t['is-pending'],
            val: t.amount * (-0.01) // Convert to outflow in cents
        };

        var categoryNode = categoryLookup[t.categorization].node;
        categoryNode.children.push(newNode);
    });

    //
    // TODO: Sort transactions by estimated vendor / amount
    //

    // TODO: Decide if we need to create objects for links here.
    console.log('numCategories: ', numCategories, ' numTransactions: ', numTransactions);
    return {root: root};
}


function positionsFromTree (root, graphWidth, graphHeight) {
    var nodes = [];
    var offsets = {
        account: 0.1,
        user: 0.2,
        category: 0.5,
        transaction: 0.9
    };

    var totals = {
        account: 0,
        user: 0,
        category: 0,
        transaction: 0
    };

    positionsHelper(root, graphWidth, graphHeight, nodes, offsets, totals);
    return nodes;
}


function positionsHelper (node, graphWidth, graphHeight, nodes, offsets, totals) {
    var blank = { y: 0, x: 0, node: null , width: 25, height: 150};

    // Recursively call children
    if (node.type === 'user') {
        _.each(node.accounts, function(v) {
            positionsHelper(v, graphWidth, graphHeight, nodes, offsets, totals);
        });
        _.each(node.categories, function(v) {
            positionsHelper(v, graphWidth, graphHeight, nodes, offsets, totals);
        });
    } else if (node.type === 'category') {
        _.each(node.children, function(v) {
            positionsHelper(v, graphWidth, graphHeight, nodes, offsets, totals);
        });
    }

    // Set sizes based on value.
    if (node.type === 'category' || node.type === 'transaction') {
        blank.height = Math.max(4, Math.round(node.val / 1000));
        // blank.r = Math.round(node.val / 10000);
    }

    blank.height = Math.abs(blank.height);
    blank.x = offsets[node.type] * graphWidth;
    blank.y = totals[node.type] + margin;
    blank.node = node;

    totals[node.type] += blank.height + margin;
    nodes.push(blank);
}


function resizeNodes (nodes, graphWidth, graphHeight) {
    var maxY = _.max(_.map(nodes, function (v) {
        return v.y + v.height;
    }));

    // TODO: Account for margin.
    var multFactor = (graphHeight - 50) / maxY;

    // Resize everything
    _.each(nodes, function (node) {
        if (node.node.type === 'category' || node.node.type === 'transaction') {
            node.height = Math.max(4, Math.floor(node.height * multFactor));
            node.y = Math.floor(node.y * multFactor);
        }
    });

    // Center everything
    _.each(['account', 'user', 'category', 'transaction'], function (type) {
        var maxY = _.max(_.map(nodes, function (v) {
            if (v.node.type === type) {
                return v.y + v.height;
            }
            return 0;
        }));
        var delta = Math.floor((graphHeight - maxY)/2);
        _.each(nodes, function (node) {
            if (node.node.type === type) {
                node.y += delta;
            }
        });
    });

}

function getLinksFromNodes (nodes) {
    // Structure:
    //
    // [ link1, link2, ... ]
    //
    // link1 = [start, stop]
    // start = {x: xcoord, y0: ycoord-bottom, y1: ycoord-top}

    // TODO: Make this do more than left->right expenses.
    var links = []
    _.each(nodes, function (node) {
        var children = [];
        if (node.node.type === 'account') {
            return;
        } else if (node.node.type === 'user') {
            children = node.node.categories;
        } else if (node.node.type === 'category') {
            children = node.node.children;
        }

        // So we can partition edges coming out.
        // TODO: Make it so expenses are treated differently from income (or filtered)
        var runningSum = 0;
        var total = 0;
        _.each(children, function (rawChild) {
            total += Math.abs(rawChild.val);
        });


        console.log('total: ', total);
        _.each(children, function (rawChild) {
            // TODO: Tag with colors
            // TODO: have hash / pointer, not search for rawChild

            var child = _.find(nodes, function (v) {
                return (v.node === rawChild);
            });
            var ratio = (runningSum/total);
            if (ratio > 1) {
                console.log('BAD RATIO')
                console.log('node: ', node, 'child: ', child);
            }
            var starty0 = Math.round( (runningSum/total) * node.height );
            runningSum += Math.abs(rawChild.val);
            var starty1 = Math.round( (runningSum/total) * node.height );

            var linkStart = {
                x: node.x + node.width,
                y0: node.y + starty0,
                y1: node.y + starty1
            }
            var linkEnd = {
                x: child.x,
                y0: child.y,
                y1: child.y + child.height
            }
            links.push([linkStart, linkEnd]);
        });
    });
    return links;
}



function createViz (root) {

    // SVG already exists. TODO: Why?

    // Add the graph group as a child of the main svg
    var margin = 10;
    var graphWidth = width - margin*2;
    var graphHeight = height - margin*2;

    var color = d3.scale.category20();

    var graph = svg
        .append("g")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", "translate(" + margin + "," + margin + ")"); // Offsets coordinate system

    // TODO: Create position map from tree.
    var nodes = positionsFromTree(root, graphWidth, graphHeight);
    console.log('Nodes: ', nodes);
    resizeNodes(nodes, graphWidth, graphHeight);
    var links = getLinksFromNodes(nodes);
    console.log('Links: ', links);

    var rect = svg.selectAll("rect")
        .data(nodes)
        .enter()
        .append("rect")
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .attr("width", function (d) {
            return d.width;
        })
        .attr("fill", function (d) {
            if (d.node.merchant) {
                return color(d.node.merchant);
            }
            return color(d.node.name);
        });

    var area = d3.svg.area()
        .x(function (d) {
            return d.x;
        })
        .y0(function (d) {
            return d.y0;
        })
        .y1(function (d) {
            return d.y1;
        })
        .interpolate('cardinal');

    svg.selectAll("path.area")
            .data(links)
        .enter().append("path")
            .style("fill", "rgba(10,10,150,0.33")
            .attr("class", "area")
            .attr("d", area);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "1px solid")
        .style("border-radius", "10px")
        .style("padding", "3px")
        .text("tooltip");

    rect.on("mouseover", function(d){tooltip.text(d.node.name); return tooltip.style("visibility", "visible");})
        .on("mousemove", function(d){return tooltip.style("top",
            (d3.event.pageY-15)+"px").style("left",(d3.event.pageX+15)+"px");})
        .on("mouseout", function(d){return tooltip.style("visibility", "hidden");});



    return;

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

        var tree = formatDataTree(finData);
        console.log('Tree: ', tree);
        createViz(tree.root);

    });
}


module.exports = {
    init: init
}

"use strict";

var d3          = require('d3');
var request     = require('request');
var _           = require('underscore');
var restApi     = require('./restApi.js');

// Globals! Because hackathon!
var uid = 1110568334;
var authToken = 'D88517D61377232E3BACE8CA3EA15E7B';

var mouseX;
var mouseY;
$(document).mousemove( function(e) {
    mouseX = e.pageX;
    mouseY = e.pageY;
});


var svg;
var goals;
var goalCategories;
var financialData;
var activeCategory;
var color = d3.scale.category10();
var numCategories = 0;
var numTransactions = 0;

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

var width = $('#map-container').width(),
    height = 1000,
    margin = 40;


function makeSvg() {
    svg = d3.select("#map-container").append("svg")
        .attr("width", width)
        .attr("height", height);
}

function formatDataTree(data, allowedCategory) {

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
        if (t.amount > 0) return; // Prevents income from being in expenses

        if (!categoryLookup.hasOwnProperty(t.categorization)) {
            // First time we saw this category
            // Make node for category
            numCategories += 1;

            var newCategoryNode = {
                name: t.categorization,
                type: 'category',
                children: [],
                id: t.categorization,
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

    // Sort categories by amount
    root.categories = _.sortBy(root.categories, function (node) {
        return -1 * node.val; // Descending
    });
    _.each(root.categories, function (node, i){
        categoryLookup[node.name].index = i;
    });

    _.each(data.transactions, function (t, idx) {
        // if (idx > 20) return; // Hack to keep it small
        if (t.amount > 0) return; // Prevents income from being in expenses


        if (t.categorization === allowedCategory) {
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
        }

    });

    // Sort transactions by merchant
    _.each(root.categories, function (categoryNode, i){
        var sortedChildren = _.sortBy(categoryNode.children, function (node) {
            return node.merchant;
        });
        categoryNode.children = sortedChildren;
    })

    return {root: root};
}


function positionsFromTree (root, graphWidth, graphHeight) {
    var nodes = [];
    var offsets = {
        user: 0.05,
        category: 0.35,
        transaction: 0.85
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
    var blank = { y: 0, x: 0, node: null , width: 60, height: 250};
    if (node.type === 'account') return;

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

            // Category color check
            if (node.node.type === 'user') {
                var hasCategory = _.filter(goals, function (goal) {
                    return goal.category.toLowerCase() === rawChild.name.toLowerCase();
                })
                if (hasCategory.length > 0) {
                    linkEnd.goal = true;
                    linkStart.goal = true;

                    linkEnd.goal = hasCategory[0];

                }
            } else if (node.node.type === 'category') {
                var hasMerchant = _.filter(goals, function (goal) {
                    return goal.merchant.toLowerCase() === rawChild.merchant.toLowerCase();
                })
                if (hasMerchant.length > 0) {
                    linkEnd.goal = true;
                    linkStart.goal = true;
                    linkEnd.goal = hasMerchant[0];
                }

            }


            links.push([linkStart, linkEnd]);
        });
    });
    return links;
}


function createViz (root) {

    // Add the graph group as a child of the main svg
    var margin = 10;
    var graphWidth = width - margin*2;
    var graphHeight = height - margin*2;

    // var color = d3.scale.category20();

    var graph = svg
        .append("g")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("transform", "translate(" + margin + "," + margin*3 + ")"); // Offsets coordinate system

    // TODO: Create position map from tree.
    var nodes = positionsFromTree(root, graphWidth, graphHeight);
    resizeNodes(nodes, graphWidth, graphHeight);
    var links = getLinksFromNodes(nodes);

    var rect = svg.selectAll("rect")
        .data(nodes, function (d) {
            return d.node.id;
        });

    rect.exit().remove();

    rect.enter()
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

    rect.attr("x", function (d) {
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

    var textLabels = svg.selectAll("text")
            .data(nodes);

    textLabels.enter()
        .append("text")

    textLabels.attr("x", function (d) {
            return d.x + 2;
        })
        .attr("y", function (d) {
            return d.y - 2;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text( function (d){
            if (d.node.val) {
                var amt = '$' + Math.floor(d.node.val) / 100;
                return d.node.name + ' ( ' + amt + ' ) ';
            }
            return ''
        });

    textLabels.exit().remove();


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

    var path = svg.selectAll("path.area")
            .data(links);

    path.exit().remove();

    var genColor = function (regular, percentage) {
        if (regular) {
            return "rgba(91,91,126,0.25)";
        }
        var opacity = 0.25 + ((Math.abs(percentage) * 0.75) / 100);
        if (percentage >= 0) {
            return "rgba(36,0,255," + opacity + ")";
        } else {
            return "rgba(203,27,60," + opacity + ")";
        }
    };

    path.enter().append("path")
            .style("fill", function (d) {
                if (d[1].goal) {
                    return genColor(false, d[1].goal.percentChange);
                }
                return genColor(true);
            })
            .attr("class", "area")
            .attr("d", area);

    path.style("fill", function (d) {
                if (d[1].goal) {
                    return genColor(false, d[1].goal.percentChange);
                }
                return genColor(true);
            })
            .attr("class", "area")
            .attr("d", area);


    rect.on("mouseover", function(d){
            if (d.node.type === 'category') {
                tooltip.text('Expand / Shrink');
            } else if (d.node.type === 'transaction') {
                tooltip.text('Create Budget Goal');
            } else if (d.node.type === 'user') {
                tooltip.text('You!');
            }
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(d){return tooltip.style("top",
            (d3.event.pageY-15)+"px").style("left",(d3.event.pageX+15)+"px");})
        .on("mouseout", function(d){return tooltip.style("visibility", "hidden");})
        .on("click", function (d){
            if (d.node.type === 'category') {
                if (d.node.name === activeCategory) {
                    console.log('Undoing');
                    dataToViz();
                } else {
                    dataToViz(d.node.name);
                }
            }
            if (d.node.type === 'transaction') {
                var html = Handlebars.templates["mapGoal"]({name: d.node.name});
                $('body').append(html);
                $('.mapGoal').css({'top': mouseY, 'left':mouseX - 450}).fadeIn('slow');
                $('#close-button').on('click', function() {
                    $(this).parent().parent().parent().remove();
                });
                var category = d.node.category;
                $('#goalSubmit').click(function (e) {
                    e.preventDefault();
                    var merchant = $('#merchantName').text();
                    var percentage = $('#percentage').val();
                    restApi.setGoal(uid, authToken, merchant, percentage, category, function (err, data) {
                        restApi.getGoals(uid, authToken, function (err, data) {
                            goals = data.goalList;
                            dataToViz(activeCategory);
                        });
                    });
                });
            }
        });

}

function dataToViz (category) {
    activeCategory = category;
    var tree = formatDataTree(financialData, category);
    createViz(tree.root);
}


function init () {
    console.log('Initializing Financial Map');
    makeSvg();

    restApi.getGoals(uid, authToken, function (err, data) {
        goals = data.goalList;
        console.log('Goals: ', goals);

        restApi.getData(uid, authToken, function (err, finData) {
            if (err) {
                console.log('ERROR: ', err);
                return;
            }
            financialData = finData;
            dataToViz('fakeCategory&&&');

            // TODO: Move this where it belongs
            $('#map-container').append('<div id="categoryTitle"><h4>Categories</h4></div>');
            $('#categoryTitle').css({'top': -10, 'left':width * 0.35, 'position':'absolute'});
            $('#map-container').append('<div id="merchantTitle"><h4>Merchants</h4></div>');
            $('#merchantTitle').css({'top': -10, 'left':width * 0.85, 'position':'absolute'});
            $('#map-container').append('<div id="youTitle"><h4>You</h4></div>');
            $('#youTitle').css({'top': -10, 'left':width * 0.05, 'position':'absolute'});

        });
    });

}


module.exports = {
    init: init
}

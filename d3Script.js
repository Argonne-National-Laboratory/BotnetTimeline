/********************** Sizes **********************/
var outerWidth = 1260;
var outerHeight = 25000;
var margin = {
  left: 300,
  top: 300,
  right: 300,
  bottom: 500
};
// Set the square size range:
var squareMin = 20;
var squareMax = 40;

var expandSize = "300px";
var iconSize = 200;
var startTimeline = 100;

/* Optional for Labeling Axis
var xAxisLabelText = "X Variable";
var xAxisLabelOffset = 48;
var yAxisLabelText = "Y Variable (Year)";
var yAxisLabelOffset = 30;
*/

// Calcuate the area which can be graphable taking into account margins
var innerWidth = outerWidth - margin.left - margin.right;
var innerHeight = outerHeight - margin.top - margin.bottom;

/********************** Data Column Variables **********************/
var xColumn = "x";
var yColumn = "year";
var squareColumn = "size";
var nameColumn = "name";
var descriptionColumn = "description";
// This variable can be used when additional data is collected to modify the 
// the color. Currently, the color is dependent on yColumn (or year).
// var colorColumn = "color";

/********************** Scales **********************/
var xScaleLeft = d3.scale.linear().range([innerWidth / 2, 0]);
var xScaleRight = d3.scale.linear().range([innerWidth / 2, innerWidth]);
var yScale = d3.scale.linear().range([0, innerHeight]);
var squareScale = d3.scale.linear().range([squareMin, squareMax]);
var colorScale = d3.scale.linear().range(["#33FFFF", "#8633FF"]);

/********************** Y and X Postion **********************/

/**
* This function calculates the scaled x position alternating from left to right side 
* to the timeline axis.
* @method xPosition
* @param {Object} d - contains data of passed in botnet
* @param {Integer} i - index number of d
* @return {Real} - Scaled x position on left or right of timeline 
*                  dependent on the index variable. 
*/
function xPosition(d, i) {
  // If index is odd, add to left side
  if (i % 2 === 1) {
    return xScaleLeft(d[xColumn]) - squareScale(d[squareColumn]);
  }
  // Otherwise, index is even, add to right side
  else {
    return xScaleRight(d[xColumn]);
  }
};

/**
* This function calculates the scaled y position adding padding to resolve collisons.
* @method yPosition
* @param {Object} d - contains data of passed in botnet
* @param {Integer} i - index number of d
* @return {Real} - Scaled y position with added padding
*/
function yPosition(d, i) {
  var interval = i % 100;
  var addedPadding = interval / 100;

  return yScale((d[yColumn] + addedPadding)) - squareScale(d[squareColumn]) / 2;
};

/********************** Move "box" to Front Function **********************/

/**
* This function brings the botnet on hover to front preventing overlapping.
* @method moveToFront
*/
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
};

/************* Mouseover/Mouseout Animation Functions *************/

/**
* This function initializes the animation of the botnet box 
* expanding and tracing line when user mouseover. 
* @method mouseover
* @param {Object} d - contains data of the mouseovered botnet
* @param {Integer} i - index number of d
*/
function mouseover(d, i) {
  var y = yPosition(d,i);
  if (i % 2 === 1) {
    var selectedLine = d3.select("#lineNum" + i)
                         .attr("d",
                          "M " + (innerWidth / 2) +
                          "," + -iconSize / 4 + ", L " + (innerWidth / 2) +
                          "," + (y+(squareScale(d[squareColumn])/2)) +
                          " L " + (xScaleLeft(d[xColumn])) +
                          "," + (y+(squareScale(d[squareColumn])/2)));
  } else {
    var selectedLine = d3.select("#lineNum" + i)
                         .attr("d",
                          "M " + (innerWidth / 2) +
                          "," + -iconSize / 4 + ", L " + (innerWidth / 2) +
                          "," + (y+(squareScale(d[squareColumn])/2)) +
                          " L " + (xScaleRight(d[xColumn])) +
                          "," + (y+(squareScale(d[squareColumn])/2)));
  }

  var length = selectedLine.node().getTotalLength();
  /* Line Animation */
  selectedLine.attr("stroke-dasharray", length + " " + length)
              .attr("stroke-dashoffset", length)
              .transition()
//              .delay(100)
              .duration(1000)
              .ease("linear")
                .style("opacity", 1)
              .attr("stroke-dashoffset", 0);
  /* Box Animation */
  var selectedBox = d3.select(this)
                      .moveToFront()
                      .transition()
                      .duration(1000)
                      .attr("width", expandSize)
                      .attr("height", expandSize)
                      .style("border-radius", "10px")
                      .style("opacity", 1)
                      .style("background-color", "#9A031E");

  /* Content Visible */
  var selectedContent = d3.select("#contentNum" + i);

  selectedContent.transition()
                 .duration(1000)
                 .style("background-color", "#9A031E")
                 .style("visibility", "visible")
                 .style("border-radius", "10px");
};

/**
* This function initializes the animation of the botnet box 
* returning to intial size, reverses the tracing line, 
* and sets color to red when user mouseout. 
* @method mouseout
* @param {Object} d - contains data of the mouseouted botnet
* @param {Integer} i - index number of d
*/
function mouseout(d, i) {
  var selectedBox = d3.select(this)
                      .transition()
                      .delay(100)
                      .duration(1000)
                      .attr("width", function(d) {
                        return squareScale(d[squareColumn]);
                      })
                      .attr("height", function(d) {
                        return squareScale(d[squareColumn]);
                      })
                      .style("border-radius", "2px");


  var selectedContent = d3.select("#contentNum" + i).transition().style("visibility", "hidden");

  var selectedLine = d3.select("#lineNum" + i);
  var length = selectedLine.node().getTotalLength();
  /* Line Animation */
  selectedLine.transition()
    .duration(500)
    .delay(1000)
    .ease("linear")
    .attr("stroke-dashoffset", length);

};



/********************** Timeline Setup **********************/

/* Set the height and width of our canvas element */
var canvas = d3.select("#chart")
               .append("svg")
               .attr("class", "canvas")
               .attr("width", outerWidth)
               .attr("height", outerHeight)
               .style("margin", "auto");

/* Set up area to graph */
var graphArea = canvas.append("g")
                      .attr("class", "graphArea")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* Create extended line to connect to icon */
var extendedLine = graphArea.append("line")
                            .attr("class", "extendedLine")
                            .attr("x1", innerWidth / 2)
                            .attr("y1", -iconSize / 4)
                            .attr("x2", innerWidth / 2)
                            .attr("y2", startTimeline)
                            .style("stroke", "lightgray")
                            .style("stroke-width", 5);

/* Append icon image to top, middle of timeline */
var virusIcon = graphArea.append("image")
                         .attr('xlink:href', 'BotMaster.svg')
                         .attr('class', 'virusIcon')
                         .attr('height', iconSize)
                         .attr('width', iconSize)
                         .attr("transform", "translate(" + ((innerWidth / 2) - (iconSize / 2)) + ",-" + iconSize + ")");


/* Creating a group for axis */
var axisArea = graphArea.append("g")
                        .attr("class", "axis")
                        .attr("transform", "translate(" + innerWidth / 2 + "," + startTimeline + ")");

/* Axis Creation */
var axis = d3.svg.axis()
                 .scale(yScale)
                 .orient("left")
                 .ticks(20)
                 .tickFormat(d3.format("d"))
                 .outerTickSize(0);



/********************** Main Data Input Function **********************/
/**
* This function processes the botnet data from the csv file to determine 
* the domains from the max and min of the data set, forming an axis, 
* and the creation of each scaled botnet square.
* @method preprocessing
* @param {Object} data - contains botnet data 
*/
function preprocessing(data) {

  /* Finding Domains */
  xScaleLeft.domain(d3.extent(data, function(d) {
    return d[xColumn];
  }));
  xScaleRight.domain(d3.extent(data, function(d) {
    return d[xColumn];
  }));
  yScale.domain(d3.extent(data, function(d) {
    return d[yColumn];
  }));
  squareScale.domain(d3.extent(data, function(d) {
    return d[squareColumn];
  }));
  colorScale.domain(d3.extent(data, function(d) {
    return d[yColumn];
  }));

  /* Call for creation of axis */
  axisArea.call(axis).selectAll("text").style("background-color", "white");

  var foreignObjects = graphArea.selectAll(".box").data(data);
  var paths = graphArea.selectAll(".solidLines").data(data);

  /* Append paths and foreign objects "boxes" */
  foreignObjects.enter().append("foreignObject");
  paths.enter().append("path");

  /* Creating a class and id's for paths */
  paths.attr("class", "solidLines")
       .attr("id", function(d, i) {
         return "lineNum" + i;
       });

  /* Initializing characteristcs for foreign objects "boxes" */
  foreignObjects.attr("class", "box")
                .attr("id", function(d, i) {
                  return "boxNum" + i;
                })
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("width", function(d) {
                  return squareScale(d[squareColumn]);
                })
                .attr("height", function(d) {
                  return squareScale(d[squareColumn]);
                })
                .style("background-color", function(d) {
                  return colorScale(d[yColumn]);
                })
                .style("overflow", "hidden")
                .style("border-radius", "2px")
                .style("opacity",0.5)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);

    /* For Optional Labels */
  
//    foreignObjects.select("text")
//                  .data(data)
//                  .enter()
//                  .append("text")
//                  .text(function(d) { return d[nameColumn]; })
//                  .attr("class", "names")
//                  .attr("x", function (d){ return xScale(d[xColumn])+(squareScale(d[squareColumn])/2); })
//                  .attr("y", function (d){ return yScale(d[yColumn])+(squareScale(d[squareColumn])/2); })
//                  .style("text-anchor", "left");
//  

  /* Append html body to "boxes" */
  var htmlBox = foreignObjects.append("xhtml:body")
                              .attr("class", "boxBody")
                              .attr("id", function(d, i) {
                                return "boxBodyNum" + i;
                              })
                              .style("border-radius", "2px")
                              .style("margin", 0)
                              .style("padding", 0);

  /* Append container for content */
  var info = htmlBox.append("div")
                    .attr("class", "content")
                    .attr("id", function(d, i) {
                      return "contentNum" + i;
                    })
                    .style("background-color", function(d) {
                      return colorScale(d[yColumn]);
                    })
                    .style("visibility", "hidden");

  /* Append div for botnet name */
  var name = info.append("div")
                 .attr("class", "name")
                 .attr("id", function(d, i) {
                   return "nameNum" + i;
                 })
                 .text(function(d) {
                   return d[nameColumn];
                 });

  /* Append div for botnet date */
  var date = info.append("div")
                 .attr("class", "date")
                 .attr("id", function(d, i) {
                   return "dateNum" + i;
                 })
                 .text(function(d) {
                   return d[yColumn];
                 });

  /* Append div for botnet description */
  var description = info.append("p")
                        .attr("class", "description")
                        .attr("id", function(d, i) {
                          return "descriptNum" + i;
                        })
                        .text(function(d) {
                          return d[descriptionColumn];
                        })
                        .append("span")
                        .attr("class", "typed-cursor")
                        .attr("id", function(d, i) {
                          return "cursorNum" + i;
                        });


  foreignObjects.exit().remove();
};

/********************** Convert String -> Decimal Data Function **********************/
/**
* This function converts botnet data from strings to demicals.
* @method convert
* @param {Object} d - contains botnet data (Object of strings)
* @return {Object} d - contains botnet data with x, year, size, and color
*                      converted to decimals.
*/
function convert(d) {
  d.x = +d.x;
  d.year = +d.year;
  d.size = +d.size;
  d.color = +d.color;
  return d;
};


/********************** Call Main Data Input Function **********************/
d3.csv("botnet_database_final.csv", convert, preprocessing);

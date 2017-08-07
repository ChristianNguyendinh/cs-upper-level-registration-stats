// initial dataset
dataObj = {
    "CMSC412": {
        "0101": [
            {
                "open":"25",
                "total":"25",
                "wait":"0",
                "date":"03-30-17"
            },
            {
                "open":"21",
                "total":"25",
                "wait":"0",
                "date":"03-31-17"
            },
            {
                "open":"15",
                "total":"25",
                "wait":"0",
                "date":"04-01-17"
            },
            {
                "open":"14",
                "total":"25",
                "wait":"0",
                "date":"04-02-17"
            },
            {
                "open":"5",
                "total":"25",
                "wait":"0",
                "date":"04-03-17"
            }
        ],
        "0201": [
            { 
                "open":"15",
                "total":"25",
                "wait":"0",
                "date":"03-30-17"
            },
            {
                "open":"10",
                "total":"25",
                "wait":"0",
                "date":"03-31-17"},
            {
                "open":"9",
                "total":"25",
                "wait":"0",
                "date":"04-01-17"
            },
            {
                "open":"5",
                "total":"25",
                "wait":"0",
                "date":"04-02-17"
            },
            {
                "open":"2",
                "total":"25",
                "wait":"0",
                "date":"04-03-17"
            }
        ]
    }
};

//=================================================================
//=================================================================
//=================================================================



var margin = {top: 85, right: 20, bottom: 40, left: 80};
var width = 1100 - margin.right - margin.left;
var height = 700 - margin.top - margin.bottom;

// init scales
var scaleLineX = d3.scalePoint().rangeRound([0, width]);
var scaleLineY = d3.scaleLinear().rangeRound([height, 0]);

var xAxis = null;
var yAxis = null;

// Create line function for x,y positions
var line = d3.line()
    .x(function(d, i) { return scaleLineX(d.date) })
    .y(function(d, i) { return scaleLineY(parseInt(d.open)) });

// Initialize line chart svg
var lineChart = d3.select("#lineChart")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.left) + " " + (height + margin.top + margin.bottom))
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// call to get data - d3.json() ???

lineChartData = dataObj['CMSC412'];
var keyArray = Object.keys(lineChartData);
var colorArray = ["#34c", "#3c4", "#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"]

// Set domain for scales
scaleLineX.domain(lineChartData[keyArray[0]].map(function(d) { return d.date }));

var maxY = d3.max(keyArray, 
    function(d) { 
        return d3.max(lineChartData[d], function(d1) { return parseInt(d1['open']); });
    }
);
scaleLineY.domain([0, maxY]);

// Create Axes
xAxis = d3.axisBottom(scaleLineX);
yAxis = d3.axisLeft(scaleLineY);

// Append the x axis 
var xObj = lineChart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Append the Y axis
lineChart.append("g")
    .attr("class", "y axis")
    .call(yAxis);

// Title
lineChart.append("g")
    .attr("transform", "translate(" + width * 0.3 + ",-25)")
    .append("text")
        .html("CMSC412")

// Background grid
lineChartData[keyArray[0]].forEach(function(day, index) {
    lineChart.append("line")
        .attr("x1", scaleLineX(day['date']))
        .attr("y1", 0)
        .attr("x2", scaleLineX(day['date']))
        .attr("y2", height)
        .attr("stroke", "grey");
});

scaleLineY.ticks().forEach(function(label, index) {
    lineChart.append("line")
        .attr("x1", 0)
        .attr("y1", scaleLineY(label))
        .attr("x2", width)
        .attr("y2", scaleLineY(label))
        .attr("stroke", "grey");
})

// Legend
var legend = lineChart.append("g")
    .attr("transform", "translate(" + width * .8 + ",0)")

legend.append("rect")
    .attr("width", "15%")
    .attr("height", "15%")
    .attr("stroke", "black")
    .attr("fill", "white");
    //.attr("fill-opacity", "0");

// Tooltip -- May just need to declare once at the top or sumthing, then reuse for charts
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Data Lines
keyArray.forEach(function(element, index) {
    // Draw the line
    lineChart.append("path")
        .datum(lineChartData[element])
        .attr("class", "my-line")
        .attr("d", line)
        .attr("stroke", colorArray[index]);

    // Draw the dots
    lineChart.selectAll(".dot-" + element)
        .data(lineChartData[element])
        .enter()
        .append("circle")
            .attr("r", 7)
            .attr("cx", function(d, i) { return scaleLineX(d.date) })
            .attr("cy", function(d, i) { return scaleLineY(d.open) })
            .attr("fill", colorArray[index])
            .attr("class", "dot dot-" + element)
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html("Date: " + d.date + "<br/>" + "Seats Open: <b>" + d.open + "</b>")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px")
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    // add color to legend
    legend.append("rect")
        .attr("x", index < 4 ? 15 : 95)
        .attr("y", 22 * (index % 4) + 8)
        .attr("width", "15px")
        .attr("height", "15px")
        .attr("stroke", "black")
        .attr("fill", colorArray[index]);

    // Add text to legend
    legend.append("text")
        .attr("x", index < 4 ? 40 : 120)
        .attr("y", 22 * (index % 4 + 1))
        .html(element)
});



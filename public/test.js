// Shared tooltip
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// format x axis date tick labels
function formatTick(d, i, len) {
	var mod = 0;
	if (len <= 5) {
		mod = 0
	} else if (len <= 40) {
		mod = 2
	} else {
		mod = 5
	}

	var spl = d.split("-");
	if (i % mod == 0) {
		return spl[0] + "/" + spl[1];
	} else {
		return ""
	}
}

// Generate a chart based on data. Expected data is an object containing a key with each
// section of a course. Each section key maps to an array containing the seat availability
// info for that section for a set of days
function genChart(data, className) {

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

    // Make the chart container
    var container = d3.select("body").append("div")
        .attr("class", "chart-container")
        .style("opacity", 0)
        .style("width", "45%");

    container.append("span")
        .attr("class", "x-button")
        .attr("onclick", "removeGraph(this)")
        .html("&cross;")

    // Initialize line chart svg
    var lineChart = container.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.left) + " " + (height + margin.top + margin.bottom))
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // use passed in data
    lineChartData = data;
    var keyArray = Object.keys(lineChartData);

    // coloring will prolly change
    var colorArray = ["#34c", "#3c4", "#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"];

    // Set domain for scales
    var dates = lineChartData[keyArray[0]].map(function(d) { return d.date });
    scaleLineX.domain(dates);

    var maxY = d3.max(keyArray, 
        function(d) { 
            return d3.max(lineChartData[d], function(d1) { return parseInt(d1['open']); });
        }
    );
    scaleLineY.domain([0, maxY]);

    // Create Axes
    xAxis = d3.axisBottom(scaleLineX).tickFormat(function(d, i) { return formatTick(d, i, dates.length); });
    yAxis = d3.axisLeft(scaleLineY);

    // Append the x axis 
    var xObj = lineChart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .style("font-size", "20px")
        .call(xAxis);

    // Append the Y axis
    lineChart.append("g")
        .attr("class", "y axis")
        .style("font-size", "20px")
        .call(yAxis);

    // Title
    lineChart.append("g")
        .attr("transform", "translate(" + ((width / 2.5)) + ",-30)")
        .append("text")
            .html(className.replace("CMSC", "CMSC-"))
            .attr("font-size", "40")

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

    container.transition()
    	.duration(1000)
    	.style("opacity", 1);

}


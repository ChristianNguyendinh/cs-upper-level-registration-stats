var data;

function genDataProperties(data, sectionName) {
    return {
        label: sectionName + " Seats Open",
        fill: false,
        lineTension: 0.0,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: dataToArray(data),
        spanGaps: false
    };
};

function generateDataset(courseName) {
    var ds = [];
    for (var section in data[courseName]) {
        ds.push(genDataProperties(data[courseName][section], section));
    }
    return ds;
}

function getMaxTotal(courseName) {
    var max = 0;
    for (var section in data[courseName]) {
        max = Math.max(max, data[courseName][section][0]['total']);
    }
    return max;
}

function generateOptions(courseName) {
    return {
        title: {
            display: true,
            text: courseName
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Days ago"
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: "Seats Open",
                },
                ticks: {
                    suggestedMin: 0,
                    suggestedMin: getMaxTotal(courseName),
                }
            }]
        }
    }
}
                
function getPastDates(courseName) {
    var pastDateArr = [];
    // may need to changed to a passed in date?
    var d = new Date();
    // yea we need to set this to the greatest date passed in and stuff
    d.setDate(d.getDate() - 1);
    // get # of days of data returned
    var numDays = data[courseName][Object.keys(data[courseName])[0]].length;

    pastDateArr.unshift(d.toString().substring(4, 10));
    for (var i = 1; i < numDays; i++) {
        d.setDate(d.getDate() - 1);
        pastDateArr.unshift(d.toString().substring(4, 10));
    }
    return pastDateArr;
}

function dataToArray(d) {
    var dataArr = [];

    // maybe we should do more processing serverside?
    d.sort(function(a, b) {
        var d1 = new Date(a['date']);
        var d2 = new Date(b['date']);
        if (d1 < d2)
            return -1;
        else if (d1 > d2)
            return 1
        else
            return 0;
    });

    for (var i = 0; i < d.length; i++) {
        dataArr.push(d[i]['open']);
    }
    return dataArr;
}

// this is a bit slowwww.....
$.ajax({type: "GET", url: "../api/stats"}).done(function(d) {
    data = d;
}).then(function() {
    for (var course in data) {
        if (course != "course") {
            var ele = document.createElement('div');
            ele.style.width = "90%";
            ele.style.height = "90%";
            var can = document.createElement('canvas');
            can.id = "chart-" + course;
            ele.appendChild(can);
            document.getElementById('content').appendChild(ele);

            var ctx = document.getElementById("chart-" + course);
            var poop = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: getPastDates(course),
                    datasets: generateDataset(course)
                },
                options: generateOptions(course)
            });
        }
    }
});
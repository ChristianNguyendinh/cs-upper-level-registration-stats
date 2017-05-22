const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const MANUAL_MODE = process.argv[2];
const pg = require('pg');
const conString = process.env.DATABASE_URL || 'postgres://localhost:5432/christian';

// Srape the data, print out optionally, TODO: Save in DB and email
function collectData() {
    var basic_upper_levels = ["CMSC411", "CMSC412", "CMSC414", "CMSC417", 
        "CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", 
        "CMSC426", "CMSC430", "CMSC433", "CMSC434", "CMSC435", 
        "CMSC436", "CMSC451", "CMSC460", "CMSC466", "CMSC474"]

    var upper_level_list = basic_upper_levels.join(",");
    // String representation of data for manual extraction and emailing
    var dataString = "";
    // Object representation of data for storage
    var dataObject = {}
    var totalSections = 0;

    // USING THEIR API
    request.get(
        {
            'baseUrl': "https://ntst.umd.edu/",
            'url': "soc/201708/sections?courseIds=" + upper_level_list,
        },
        function(err, res, body) {
            var $ = cheerio.load(body);
            dataString += "---------------\n";

            $('.course-sections').each(function(i, elem) {
                var courseId = $(this)[0]['attribs']['id'];
                dataString += courseId + "\n";
                dataString += "---------------\n\n";
                dataObject[courseId] = [];

                $(this).find('.section-info-container').each(function(i, elem) {
                    var sectionObject = {};
                    var sectionName = $(this).find('.section-id').text().trim();
                    dataString += "Section: " + $(this).find('.section-id').text().trim() + "\n";
                    sectionObject['section'] = sectionName; 

                    var totalSeats = $(this).find('.total-seats-count').text().trim()
                    dataString += "Total Seats: " + totalSeats + "\n";
                    sectionObject['total'] = totalSeats;

                    var openSeats = $(this).find('.open-seats-count').text().trim();
                    dataString += "Open Seats: " + openSeats + "\n";
                    sectionObject['open'] = openSeats;

                    $(this).find('.waitlist-count').each(function(i, elem) {
                        if (i == 0) { // only want waitlist, not holdfile
                            var waitlistCount = $(this).text();
                            dataString += "Waitlist: " + waitlistCount + "\n" + "\n";
                            sectionObject['waitlist'] = waitlistCount;
                        }
                    });

                    dataObject[courseId].push(sectionObject);
                    totalSections++;
                });

                dataString += "---------------\n";
            });

            // email and save in db here
            if (MANUAL_MODE) {
                console.log(dataString);
            } else {
                loadData(dataObject, totalSections, dataString);
            }

        }
    );
}

function loadData(dataObj, totalSections, dataString) {
    let currDate = new Date();
    let dateString = "";
    dateString += currDate.getMonth() < 10 ? "0" + currDate.getMonth().toString() : currDate.getMonth().toString();
    dateString += "-" + currDate.getDate().toString();
    dateString += "-" + currDate.getFullYear().toString();

    let curr = 0;

    pg.connect(conString, (err, client, done) => {
        if (err) return console.error(err);

        Object.keys(dataObj).forEach(function(course) {
            dataObj[course].forEach(function(section) {
                // console.log(course + " " + section.section + " " + section.total + " " + section.open + " " + section.waitlist);
                client.query('INSERT INTO courses (course, section, open, total, waitlist, date) VALUES ($1, $2, $3, $4, $5, $6);',
                    [course, section.section, section.open, section.total, section.waitlist, dateString])
                .then(() => {
                    curr++;
                    done();
                    if (curr >= totalSections) {
                        saveLogs(dataString, dateString);
                    }
                });
            });
        });
    });
}

function saveLogs(dataString, date) {
    fs.writeFile("./logs/" + date + "_stats.txt", dataString, function(err) {
        if (err) {
            return console.error(err);
        }

        console.log("Log Saved!");
    });

    cleanup();
}

function cleanup() {
    console.log("Data Collected!");
    pg.end();
}

module.exports = function run() {
    if (process.argv.length <= 3) {
        if (MANUAL_MODE && (MANUAL_MODE != "-p" && MANUAL_MODE != "--print")) {
            console.error("Optional 1 argument of -p or --print");
            process.exit(4);
        }
    } else {
        console.error("Too many arguments. Expected 1 (-p or --print) or 0")
    }

    collectData();
}




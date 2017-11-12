/*

Scrapes Data via the api that populates UMD course list page
Methods thats print out the data, store data in the DB,
write the data to a local log file, and upload the data to
dropbox

Currently stores data in the DB, then uploads the data to dropbox

*/

const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const MANUAL_MODE = process.argv[2];
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(__dirname + "/data/courses.db");
const config = require(__dirname + "/config/settings.js");
const Dropbox = require("dropbox");

// const pg = require("pg");
// const conString = process.env.DATABASE_URL || "postgres://localhost:5432/christian";

// Determines the corresponding table name to write data to
var semesters = config.activeSemesters;

// For printing with timestamp
function printInfo(msg) {
    var dt = new Date().toString().substring(0, 24);
    console.log(dt + " >> " + msg);
}

function getClassList(semester) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester + "/CMSC",
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var classArray = [];
            var total = $(".course-id").length;
            var current = 0;

            var p = new Promise(function(resolve, reject) {
                $(".course-id").each(function(i, elem) {
                    var course = elem.children[0].data;
                    setTimeout(function () {
                        // Match 400s and 300s with digit at the end (special topics or whatever)
                        if (course.match(/^CMSC4[\d\w]{2}$/) || course.match(/^CMSC[3][\d]{2}[A-Z]$/)) {
                            classArray.push(course);
                        }
                        current++;
                        if (current == total) {
                            resolve()
                        }
                    }, 500)
                });
            }).then(function(success) {
                collectData(classArray, semester)
            }); 
        }
    );
}

// Srape the data, print out optionally, TODO: Save in DB and email
function collectData(classArray, semester) {
    console.log("===============================");
    printInfo("Data Script Starting");

    var upper_level_list = classArray.join(",");
    // String representation of data for manual extraction and emailing
    var dataString = "";
    // Object representation of data for storage
    var dataObject = {};
    var totalSections = 0;

    // USING THEIR API
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester + "/sections?courseIds=" + upper_level_list,
        },
        function(err, res, body) {
            var $ = cheerio.load(body);
            dataString += "---------------\n";

            $(".course-sections").each(function(i, elem) {
                var courseId = $(this)[0]["attribs"]["id"];
                dataString += courseId + "\n";
                dataString += "---------------\n\n";
                dataObject[courseId] = [];

                $(this).find(".section-info-container").each(function(i, elem) {
                    var sectionObject = {};
                    var sectionName = $(this).find(".section-id").text().trim();
                    dataString += "Section: " + $(this).find(".section-id").text().trim() + "\n";
                    sectionObject["section"] = sectionName; 

                    var totalSeats = $(this).find(".total-seats-count").text().trim();
                    dataString += "Total Seats: " + totalSeats + "\n";
                    sectionObject["total"] = totalSeats;

                    var openSeats = $(this).find(".open-seats-count").text().trim();
                    dataString += "Open Seats: " + openSeats + "\n";
                    sectionObject["open"] = openSeats;

                    $(this).find(".waitlist-count").each(function(i, elem) {
                        if (i == 0) { // only want waitlist, not holdfile
                            var waitlistCount = $(this).text();
                            dataString += "Waitlist: " + waitlistCount + "\n" + "\n";
                            sectionObject["waitlist"] = waitlistCount;
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
                loadData(dataObject, totalSections, dataString, semester);
            }

        }
    );
}

// Load data into SQLite3 DB. Commented out Postgres version
function loadData(dataObj, totalSections, dataString, semester) {
    let currDate = new Date();
    let dateString = "";
    let month = currDate.getMonth() + 1;
    let date = currDate.getDate();
    dateString += month < 10 ? "0" + month.toString() : month.toString();
    dateString += "-";
    dateString += date < 10 ? "0" + date.toString() : date.toString();
    dateString += "-" + currDate.getFullYear().toString();

    let curr = 0;

    // pg.connect(conString, (err, client, done) => {
    //     if (err) return console.error(err);

    //     Object.keys(dataObj).forEach(function(course) {
    //         dataObj[course].forEach(function(section) {
    //             // console.log(course + " " + section.section + " " + section.total + " " + section.open + " " + section.waitlist);
    //             client.query("INSERT INTO courses (course, section, open, total, waitlist, date) VALUES ($1, $2, $3, $4, $5, $6);",
    //                 [course, section.section, section.open, section.total, section.waitlist, dateString])
    //             .then(() => {
    //                 curr++;
    //                 done();
    //                 if (curr >= totalSections) {
    //                     saveLogs(dataString, dateString);
    //                 }
    //             });
    //         });
    //     });
    // });

    db.serialize(() => {
        Object.keys(dataObj).forEach(function(course) {
            dataObj[course].forEach(function(section) {
                // console.log(course + " " + section.section + " " + section.total + " " + section.open + " " + section.waitlist);

                db.run("INSERT INTO \"" + semester + "\" (course, section, open, total, waitlist, date) VALUES ($1, $2, $3, $4, $5, $6);",
                    [course, section.section, section.open, section.total, section.waitlist, dateString],
                    (err, row) => {
                        curr++;
                        if (curr >= totalSections) {
                            printInfo("DB Successfully Loaded!");
                            // saveLogs(dataString, dateString);
                            uploadLogs(dataString, dateString, semester);
                        }
                        if (err) {
                            printInfo("DB Load FAILED! ERROR : " + err);
                        }
                    }
                );
            
            });
        });
    });
}

// Save logs locally to the log folder
function saveLocalLogs(dataString, date) {
    var filepath = __dirname + "/logs/" + date + "_stats.txt";
    fs.writeFile(__dirname + "/logs/" + date + "_stats.txt", dataString, function(err) {
        if (err) {
            return printInfo("Log Save FAILED! ERROR : " + err);
        }
        printInfo("Log Saved! at " + filepath);
        cleanup();
    });
}

// upload logs to dropbox
function uploadLogs(dataString, date, semester) {
    var uploadPath = "/" + semester + "/" + date + "_stats.txt";

    var dbx = new Dropbox({ accessToken: config.DROPBOX_TOKEN });

    dbx.filesUpload({ path: uploadPath, contents: dataString })
        .then((response) => {
            printInfo("Log Uploaded to DropBox! at " + uploadPath);
            cleanup();
        }).catch((error) => {
            printInfo("Log Upload FAILED! ERROR : " + error.message);
        });
}

// Use to be more useful i swear
function cleanup() {
    printInfo("Data Scrape Ending");
    console.log("===============================");
}

// Begin execution of the program - validate optional parameters
function run() {
    if (process.argv.length <= 3) {
        if (MANUAL_MODE && (MANUAL_MODE != "-p" && MANUAL_MODE != "--print")) {
            console.error("Optional 1 argument of -p or --print");
            process.exit(4);
        }
    } else {
        console.error("Too many arguments. Expected 1 (-p or --print) or 0");
    }

    for (var s of semesters) {
        getClassList(s);      
    }
}

run();




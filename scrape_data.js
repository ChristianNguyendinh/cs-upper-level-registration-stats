const request = require('request');
const cheerio = require('cheerio');

// Srape the data, print out optionally, TODO: Save in DB and email
function scrape() {
    var basic_upper_levels = ["CMSC411", "CMSC412", "CMSC414", "CMSC417", 
        "CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", 
        "CMSC426", "CMSC430", "CMSC433", "CMSC434", "CMSC435", 
        "CMSC436", "CMSC451", "CMSC460", "CMSC466", "CMSC474"]

    var upper_level_list = basic_upper_levels.join(",");
    // String representation of data for manual extraction and emailing
    var dataString = "";
    // Object representation of data for storage
    var dataObject = {}

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
                });

                dataString += "---------------\n";
            });

            // email and save in db here
            if (MANUAL_MODE) {
                console.log(dataString);
            } else {
                console.log(dataObject);
            }

        }
    );
}

const MANUAL_MODE = process.argv[2];

if (process.argv.length <= 3) {
    if (MANUAL_MODE && (MANUAL_MODE != "-p" && MANUAL_MODE != "--print")) {
        console.error("Optional 1 argument of -p or --print");
        process.exit(4);
    }
} else {
    console.error("Too many arguments. Expected 1 (-p or --print) or 0")
}

scrape();




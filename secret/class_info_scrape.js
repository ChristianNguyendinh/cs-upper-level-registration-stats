const request = require("request");
const cheerio = require("cheerio");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(__dirname + "test.db");

function getCategories(semester) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester,
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var classArray = [];
            var total = $(".prefix-abbrev").length;
            var current = 0;

            var p = new Promise(function(resolve, reject) {
                $(".prefix-abbrev").each(function(i, elem) {
                    classArray.push($(this).text())

                    current++;
                    if (current >= total) {
                        resolve()
                    }
                });
            }).then(function(success) {
                for (var c of classArray) {
                    console.log(c)
                }


            }); 
        }
    );
}

function getInfo(semester, classid) {
    request.get(
        {
            "baseUrl": "https://ntst.umd.edu/",
            "url": "soc/" + semester + "/sections?courseIds=" + classid
        },
        function(err, res, body) {
            if (err) return console.log(err);

            var $ = cheerio.load(body);
            var sectionArray = [];
            var total = $(".section").length;
            var current = 0;
            console.log("soc/" + semester + "/sections?courseIds=" + classid)

            var p = new Promise(function(resolve, reject) {
                $(".section").each(function(i, elem) {
                    var name = $(this).find(".section-id").text().trim();

                    $(this).find(".class-days-container").find(".row").each(function() {
                        var building = $(this).find(".building-code").text().trim();
                        var room = $(this).find(".class-room").text().trim();//.replace("ONLINE", "");
                        var days = $(this).find(".section-days").text().trim()
                        var stime = $(this).find(".class-start-time").text().trim()
                        var etime = $(this).find(".class-end-time").text().trim()

                        if (building != "") {
                            sectionArray.push({ 
                                name : name,
                                building : building,
                                room : room,
                                days : days,
                                time : stime + "-" + etime,
                            })
                        }
                    })
                    current++;
                    if (current >= total) {
                        resolve()
                    }
                });
            }).then(function(success) {
                for (var c of sectionArray) {
                    console.log(c)
                }

            }); 
        }
    );

}
// BMGT340, ASTR230, EDCP108M
getInfo("201801", "ASTR230");
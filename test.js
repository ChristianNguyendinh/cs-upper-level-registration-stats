const request = require('request');
const cheerio = require('cheerio');

var basic_upper_levels = ["CMSC411", "CMSC412", "CMSC414", "CMSC417", 
    "CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", 
    "CMSC426", "CMSC430", "CMSC433", "CMSC434", "CMSC435", 
    "CMSC436", "CMSC451", "CMSC460", "CMSC466", "CMSC474"]

var upper_level_list = basic_upper_levels.join(",");

// USING THEIR API
request.get(
	{
		'baseUrl': "https://ntst.umd.edu/",
		'url': "soc/201708/sections?courseIds=" + upper_level_list,
	},
	function(err, res, body) {
		var $ = cheerio.load(body);

		console.log("---------------");
		$('.course-sections').each(function(i, elem) {
			console.log($(this)[0]['attribs']['id']); // course id
    		console.log("---------------\n");

			$(this).find('.section-info-container').each(function(i, elem) {

				console.log("Section: " + $(this).find('.section-id').text().trim());
				console.log("Total Seats: " + $(this).find('.total-seats-count').text());
				console.log("Open Seats: " + $(this).find('.open-seats-count').text());
				$(this).find('.waitlist-count').each(function(i, elem) {
					if (i == 0) // only want waitlist, not holdfile
						console.log("Waitlist: " + $(this).text() + "\n");
				});
			});

			console.log("---------------");
		});
	}
);
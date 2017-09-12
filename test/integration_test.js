var assert = require("assert");
var request = require("supertest");
var app = require("../app.js");

// Validate that invalid/valid semesters in the url are handled properly
describe("Semester Validation", function() {
    it("should work (200) with a valid semester", function(done) {
        request(app).get("/api/201701/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 200);
            done();
        });
    });
    it("should 406 (Not Acceptable) with a invalid semester", function(done) {
        request(app).get("/api/201702/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 406);
            done();
        });
    });
    it("should 406 (Not Acceptable) with a semester not added yet", function(done) {
        request(app).get("/api/201708/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 406);
            done();
        });
    });
    it("should 404 (Not Found) with a invalid semester format", function(done) {
        request(app).get("/api/2017001/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 404);
            done();
        });
    });

    it("should 404 (Not Found) with another invalid semester format", function(done) {
        request(app).get("/api/2017O1/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 404);
            done();
        });
    });
});

// Tests out some API calls. Still a WIP
describe("API calls", function() {
    it("should return expected semesters", function(done) {
        request(app).get("/api/semesterlist").end(function(err, res) {
            assert.equal(res.statusCode, 200);
            assert(Array.isArray(res.body));

            var expected_semesterlist = ["201701"];
            var recieved_semesterlist = res.body;

            for (var semester of expected_semesterlist) {
                // check if each expected course was recieved
                assert(recieved_semesterlist.includes(semester));
            }

            done();
        });
    });
    it("should return expected courses", function(done) {
        request(app).get("/api/201701/courselist").end(function(err, res) {
            assert.equal(res.statusCode, 200);
            assert(Array.isArray(res.body));

            var expected_courselist = [
                "CMSC411", "CMSC412", "CMSC414", "CMSC417", 
                "CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", 
                "CMSC426", "CMSC430", "CMSC433", "CMSC434", "CMSC435", 
                "CMSC436", "CMSC451", "CMSC460", "CMSC466", "CMSC474"
            ];

            // deconstruct each course object formatted for autocomplete
            var recieved_courselist = res.body.map(function(courseObj) { return courseObj["value"]; });

            for (var course of expected_courselist) {
                // check if each expected course was recieved
                assert(recieved_courselist.includes(course));
            }

            done();
        });
    });
});

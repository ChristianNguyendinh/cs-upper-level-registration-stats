var assert = require("assert");
var charts = require("../public/js/charts.js");

// Helper to format the ticks for assertions
function runFormatTicks(data) {
    var result = [];
    var len = data.length;

    for (var i = 0; i < len; i++) {
        var tick = charts.formatTick(data[i], i, len);
        if (tick != "") 
            result.push(tick);
    }

    return result;
}

// Ensure charts.formatTick correctly displays number of ticks given a number of dates
describe("Charts Rendering", function() {

    describe("# Tick Formatting", function() {
        it("Should return all 4 ticks", function() {
            var dateArr = ["03-30-17","04-01-17","04-02-17","04-03-17"];

            assert.equal(runFormatTicks(dateArr).length, dateArr.length);
        });

        it("Should return all 9 ticks", function() {
            var dateArr = ["03-30-17","04-01-17","04-02-17","04-03-17","04-04-17","04-05-17","04-06-17","04-07-17","04-08-17"];

            assert.equal(runFormatTicks(dateArr).length, dateArr.length);
        });

        it("Should return 6 / 11 ticks", function() {
            var dateArr = ["03-30-17","04-01-17","04-02-17","04-03-17","04-04-17","04-05-17","04-06-17","04-07-17","04-08-17","04-09-17","04-10-17"];
            
            assert.equal(runFormatTicks(dateArr).length, 6);
        });

        it("Should return 20 / 40 ticks", function() {
            var dateArr = [
                "04-01-17","04-02-17","04-03-17","04-04-17","04-05-17","04-06-17","04-07-17","04-08-17","04-09-17","04-10-17",
                "05-01-17","05-02-17","05-03-17","05-04-17","05-05-17","05-06-17","05-07-17","05-08-17","05-09-17","05-10-17",
                "06-01-17","06-02-17","06-03-17","06-04-17","06-05-17","06-06-17","06-07-17","06-08-17","06-09-17","06-10-17",
                "07-01-17","07-02-17","07-03-17","07-04-17","07-05-17","07-06-17","07-07-17","07-08-17","07-09-17","07-10-17",
            ];
            
            assert.equal(runFormatTicks(dateArr).length, 20);
        });

        it("Should return 9 / 41 ticks", function() {
            var dateArr = [
                "04-01-17","04-02-17","04-03-17","04-04-17","04-05-17","04-06-17","04-07-17","04-08-17","04-09-17","04-10-17",
                "05-01-17","05-02-17","05-03-17","05-04-17","05-05-17","05-06-17","05-07-17","05-08-17","05-09-17","05-10-17",
                "06-01-17","06-02-17","06-03-17","06-04-17","06-05-17","06-06-17","06-07-17","06-08-17","06-09-17","06-10-17",
                "07-01-17","07-02-17","07-03-17","07-04-17","07-05-17","07-06-17","07-07-17","07-08-17","07-09-17","07-10-17","07-11-17",
            ];
            
            assert.equal(runFormatTicks(dateArr).length, 9);
        });

        it("Should return 10 / 50 ticks", function() {
            var dateArr = [
                "04-01-17","04-02-17","04-03-17","04-04-17","04-05-17","04-06-17","04-07-17","04-08-17","04-09-17","04-10-17",
                "05-01-17","05-02-17","05-03-17","05-04-17","05-05-17","05-06-17","05-07-17","05-08-17","05-09-17","05-10-17",
                "06-01-17","06-02-17","06-03-17","06-04-17","06-05-17","06-06-17","06-07-17","06-08-17","06-09-17","06-10-17",
                "07-01-17","07-02-17","07-03-17","07-04-17","07-05-17","07-06-17","07-07-17","07-08-17","07-09-17","07-10-17",
                "08-01-17","08-02-17","08-03-17","08-04-17","08-05-17","08-06-17","08-07-17","08-08-17","08-09-17","08-10-17",
            ];
            
            assert.equal(runFormatTicks(dateArr).length, 10);
        });
    });

});

// Not sure what other methods to test... we done have that many...


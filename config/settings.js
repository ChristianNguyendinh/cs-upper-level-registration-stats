/*
Master Settings file

Contains relatively "constant" properties needed by multiple parts of the application.

Some properties like env dont do much right now. Others like semester may be reworked
so we dont have to come in here any add a new semester every few months. But thats not
too bad.
*/

module.exports = {
    env : "develop", 
    // semesters we have data for
    semesters : ["201708", "201712", "201801"],
    currentSemester : "201712",
    // semesters we are currently collecting data for
    activeSemesters : ["201712", "201801"],
    // Mark start and end dates of semester somehow? to get valid date range for date picker in front end
    semesterDates : {
        "201708": { start: "2017-03-30", end: "2017-04-22" },
        "201712": { start: "2017-10-23", end: "2018-01-25" },
        "201801": { start: "2017-11-01", end: "2018-02-01" },
    },
    DROPBOX_TOKEN : "< YOUR TOKEN HERE >",
};
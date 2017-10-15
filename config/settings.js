/*
Master Settings file

Contains relatively "constant" properties needed by multiple parts of the application.

Some properties like env dont do much right now. Others like semester may be reworked
so we dont have to come in here any add a new semester every few months. But thats not
too bad.
*/

module.exports = {
    env : "develop", 
    semesters : ["201708"],
    currentSemester : "201708",
    activeSemesters : ["201712", "201801"],
    // Mark start and end dates of semester somehow? to get valid date range for date picker in front end
    semesterDates : "???",
    DROPBOX_TOKEN : "< YOUR TOKEN HERE >",
};
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
    actualSemester : "201712",
    DROPBOX_TOKEN : "< YOUR TOKEN HERE >",
};
import requests
from bs4 import BeautifulSoup

# TODO:
#
# - Are these all the classes we want to track?
#
# - Python is easiest to do this in due to bs4, JS is fine as well cause node. Both can deploy to heroku
#	for automation (flask || expressJS), i rlly dont wanna manually run this every day. 
#	We can do Java if u rlly rlly rlly want to.
#
# - Put result in DB. Sqlite3 would be eziest.
#	- Need to plan schema to keep track of differences
#		- One table for class data. i.e full course name, teacher, schedule
# 		- Another for results of each day with pk references. i.e num seats for the day
#	- logging is important, holes is data is no bueno~
#	- expose via api
#
# - Any other data we should get to visualize later? no feature creep pls.


basic_upper_levels = ["CMSC411", "CMSC412", "CMSC414", "CMSC417", 
	"CMSC420", "CMSC421", "CMSC422", "CMSC423", "CMSC424", 
	"CMSC426", "CMSC430", "CMSC433", "CMSC434", "CMSC435", 
	"CMSC436", "CMSC451", "CMSC460", "CMSC466", "CMSC474"]

upper_level_list = ",".join(basic_upper_levels) # combine into list

# USING THEIR API
r = requests.get("https://ntst.umd.edu/soc/201708/sections?courseIds=" + upper_level_list)

soup = BeautifulSoup(r.text, "html.parser")

classes = soup.find_all("div", class_ = "course-sections")
for c in classes:
	print(c.get("id")) # course id
	print("---------------\n")

	sections = c.find_all("div", "section")
	for s in sections:
		print("Section: " + s.find("input").get("value")) # section id
		print("Total Seats: " + s.find("span", class_ = "total-seats-count").contents[0]) # total seats
		print("Open Seats: " + s.find("span", class_ = "open-seats-count").contents[0]) # open seats
		print("Waitlist: " + s.find("span", class_ = "waitlist-count").contents[0] + "\n") # waitlist size

	print("---------------")


# SCRAPING DIRECTLY
# r = requests.get("https://ntst.umd.edu/soc/201708/CMSC")
# soup = BeautifulSoup(r.text, "html.parser")
# courses = soup.find_all("div", class_ = "course")
#
# for c in courses:
# 	if "CMSC4" in c.get("id"):
# 		print(c.prettify());

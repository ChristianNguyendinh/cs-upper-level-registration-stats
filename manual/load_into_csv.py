import sqlite3
import sys

# Parse according to the arbitrary format i chose for the text data files
def read_from_data_file (file_name):
	results = []
	data = {}
	last_found = ""

	with open(file_name, "r") as data_file: # open data file for reading
		line = data_file.readline()
		while line != "":
		    results.append(line.strip())
		    line = data_file.readline()

	i = 0
	while i < len(results):
		if "CMSC" in results[i]:
			data[results[i]] = {}
			last_found = results[i]
			i += 1;

		elif "Section" in results[i]:
			section = results[i].split(" ")[1]
			data[last_found][section] = {}
			data[last_found][section]['total']  = results[i + 1].split(" ")[2]
			data[last_found][section]['open']  = results[i + 2].split(" ")[2]
			data[last_found][section]['waitlist']  = results[i + 3].split(" ")[1]
			i += 4

		else:
			i += 1;

	#print(data)
	return data;

def output_to_csv (file_name):
	full_date = file_name.split("/")[-1].split("_")[0]
	data = read_from_data_file(file_name)
	for d in data:
		for s in data[d]:
			print(d + "," + s + "," + data[d][s]['open'] + "," + data[d][s]['total'] + "," + data[d][s]['waitlist'] + "," + full_date)

# convert the hacky text file storage of data to csv for import into db
def main():
	if len(sys.argv) == 1:
		print("Expected 1 or more files to convert!!\nProper form is path/to/file/MM-DD-YY_stats.txt")
		exit(1)
	# print col names
	print("course,section,open,total,waitlist,date")

	for arg in sys.argv[1:]:
		output_to_csv(arg)

if __name__ == "__main__":
    main()

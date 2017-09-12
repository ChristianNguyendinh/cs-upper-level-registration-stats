#!/bin/bash

# Install Dependencies for MAC and Linux (Currently just Ubuntu)
# Mac requires Homebrew to be installed
# Expects to be in the project root
# Clone or DL the repo then run this script to set up node

echo "Starting Setup Script"
echo "==================================="


if [[ "$EUID" -ne 0 ]]
then
	echo "RUN AS ROOT!!!"
	exit 2
fi

OSNAME="$(uname)"

if [[ $OSNAME == "Linux" ]]
then
	echo "Detected Linux OS - Assuming Ubuntu"
	echo "Installing System Dependencies"
	apt-get update
	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
	apt-get install -y nodejs
	apt-get install -y sqlite3

elif [[ $OSNAME == "Darwin" ]]
then
	echo "Detected Mac System - Homebrew must be installed"
	echo "Installing System Dependencies"
	brew update
	brew install node

else
	echo "Invalid OS"
	exit 3
fi

echo "==================================="

echo "Outputting Versions"
echo "NodeJS version - $(node --version)"
echo "npm version - $(npm --version)"
echo "sqlite3 version - $(sqlite3 --version)"

echo "==================================="

echo "Installing Node Dependencies"
npm install

echo "==================================="

echo "Setup Script Ending - npm run start or node app.js to start the webserver"



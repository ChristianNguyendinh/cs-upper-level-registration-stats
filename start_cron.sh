#!/bin/bash

# Start a cronjob to run the scrape script daily

# Get full directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

crontab -l > tempcron
echo "30 06 * * * node ${DIR}/scrape_data.js >> ${DIR}/logs/scrape-debug.log" >> tempcron
crontab tempcron
rm tempcron
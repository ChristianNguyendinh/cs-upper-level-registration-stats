## wip  
  
TODO:  
visualize data  
collect data into heroku postgres  
change from using the manual python scripts with the sqlitedb to use the automated node script data from heroku postgres  
    - script will : scrape data umd for specified classes > connect to postgresDB and store the data > modify the existing email function to return the data
  
#### Getting Started  

##### Manual  
need python 3 + pip  
(use virtual env prefferably)  
pip install -r requirements.txt  
use python scripts to manually extract data into txt > csv > sqlite. pretty gross i kno
  
##### Normal  
need node 6+  
npm install  
edit settings if need email automation backup  
node app.js  

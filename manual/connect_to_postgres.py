import os
import psycopg2
import urllib

# useage: DATABASE_URL=$(heroku config:get DATABASE_URL -a cs-upper-level-stats) python connect_to_postgres.py

urllib.parse.uses_netloc.append("postgres")
url = urlparse.urlparse(os.environ["DATABASE_URL"])

conn = psycopg2.connect(
    database=url.path[1:],
    user=url.username,
    password=url.password,
    host=url.hostname,
    port=url.port
)
# didn't end up using this
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import pandas as pd

config_file = open('./config.txt', 'r')
lines = config_file.readlines()
uri = lines[0]
config_file.close()

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

mariners_stats = pd.read_csv('./src/data/savant_data.csv', 'r')
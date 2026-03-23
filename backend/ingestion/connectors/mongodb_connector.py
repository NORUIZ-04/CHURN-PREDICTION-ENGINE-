import pandas as pd
from pymongo import MongoClient
from .base_connector import BaseConnector

class MongoDBConnector(BaseConnector):

    def connect(self):
        self.client = MongoClient(self.config["uri"])
        self.db = self.client[self.config["database"]]

    def fetch(self, collection_name: str) -> pd.DataFrame:
        collection = self.db[collection_name]
        data = list(collection.find())
        return pd.DataFrame(data)

    def close(self):
        self.client.close()
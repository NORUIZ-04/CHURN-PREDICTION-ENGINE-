import pandas as pd
from sqlalchemy import create_engine
from .base_connector import BaseConnector

class PostgresConnector(BaseConnector):

    def connect(self):
        user = self.config["user"]
        password = self.config["password"]
        host = self.config["host"]
        port = self.config.get("port", 5432)
        db = self.config["database"]

        uri = f"postgresql://{user}:{password}@{host}:{port}/{db}"
        self.engine = create_engine(uri)

    def fetch(self, query: str) -> pd.DataFrame:
        return pd.read_sql(query, self.engine)

    def close(self):
        self.engine.dispose()
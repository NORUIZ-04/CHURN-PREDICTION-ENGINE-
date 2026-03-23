import pandas as pd
from sqlalchemy import create_engine
from .base_connector import BaseConnector

class SQLiteConnector(BaseConnector):

    def connect(self):
        db_path = self.config["path"]
        self.engine = create_engine(f"sqlite:///{db_path}")

    def fetch(self, query: str) -> pd.DataFrame:
        return pd.read_sql(query, self.engine)

    def close(self):
        self.engine.dispose()
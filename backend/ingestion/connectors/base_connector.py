from abc import ABC, abstractmethod
import pandas as pd

class BaseConnector(ABC):
    """Abstract base class for database connectors."""

    def __init__(self, config: dict):
        self.config = config

    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def fetch(self, query: str) -> pd.DataFrame:
        pass

    @abstractmethod
    def close(self):
        pass
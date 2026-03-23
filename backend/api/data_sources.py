from fastapi import APIRouter
from pydantic import BaseModel
from ingestion.connectors.postgres_connector import PostgresConnector
from ingestion.connectors.mysql_connector import MySQLConnector
from ingestion.connectors.sqlite_connector import SQLiteConnector
from ingestion.pipeline import run_ingestion_pipeline
from ingestion.connectors.mongodb_connector import MongoDBConnector

router = APIRouter(prefix="/api", tags=["api"])

class DBConfig(BaseModel):
    type: str
    host: str | None = None
    port: int | None = None
    user: str | None = None
    password: str | None = None
    database: str | None = None
    path: str | None = None


@router.post("/data-source/test")
def test_connection(config: DBConfig):
    try:
        if config.type == "postgres":
            conn = PostgresConnector(config.dict())
        elif config.type == "mysql":
            conn = MySQLConnector(config.dict())
        elif config.type == "sqlite":
            conn = SQLiteConnector({"path": config.path})
        elif config.type == "mongodb":
            conn = MongoDBConnector(config.dict())
        else:
            return {"error": "Unsupported DB"}

        conn.connect()
        conn.close()

        return {"status": "connected"}

    except Exception as e:
        return {"status": "failed", "error": str(e)}
    


@router.post("/data-source/ingest")
def ingest_from_db(config: DBConfig, query: str):
    if config.type == "postgres":
        conn = PostgresConnector(config.dict())
    elif config.type == "mysql":
        conn = MySQLConnector(config.dict())
    else:
        return {"error": "Unsupported"}

    conn.connect()
    df = conn.fetch(query)
    conn.close()

    result = run_ingestion_pipeline(df)

    return result


@router.post("/data-source/tables")
def list_tables(config: DBConfig):
    try:
        if config.type == "postgres":
            conn = PostgresConnector(config.dict())
            conn.connect()
            tables = conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
            conn.close()
            return {"tables": tables["table_name"].tolist()}

        elif config.type == "mysql":
            conn = MySQLConnector(config.dict())
            conn.connect()
            tables = conn.fetch("SHOW TABLES")
            conn.close()
            return {"tables": tables.iloc[:, 0].tolist()}

        elif config.type == "sqlite":
            conn = SQLiteConnector({"path": config.path})
            conn.connect()
            tables = conn.fetch("SELECT name FROM sqlite_master WHERE type='table';")
            conn.close()
            return {"tables": tables["name"].tolist()}

        elif config.type == "mongodb":
            conn = MongoDBConnector({
                "uri": config.uri,
                "database": config.database
            })
            conn.connect()
            collections = conn.db.list_collection_names()
            conn.close()
            return {"tables": collections}

        else:
            return {"error": "Unsupported DB"}

    except Exception as e:
        return {"error": str(e)}
    

@router.post("/data-source/preview")
def preview_table(config: DBConfig, table: str):
    try:
        if config.type == "mongodb":
            conn = MongoDBConnector({
                "uri": config.uri,
                "database": config.database
            })
            conn.connect()
            data = list(conn.db[table].find().limit(5))
            conn.close()
            return {"rows": data}

        else:
            if config.type == "postgres":
                conn = PostgresConnector(config.dict())
            elif config.type == "mysql":
                conn = MySQLConnector(config.dict())
            elif config.type == "sqlite":
                conn = SQLiteConnector({"path": config.path})
            else:
                return {"error": "Unsupported DB"}

            conn.connect()
            df = conn.fetch(f"SELECT * FROM {table} LIMIT 5")
            conn.close()
            return {"rows": df.to_dict(orient="records")}

    except Exception as e:
        return {"error": str(e)}
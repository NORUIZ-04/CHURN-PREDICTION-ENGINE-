from fastapi import APIRouter                      # used to create grouped API routes
from pydantic import BaseModel                    # used for request validation
from ingestion.connectors.postgres_connector import PostgresConnector   # postgres DB handler
from ingestion.connectors.mysql_connector import MySQLConnector         # mysql DB handler
from ingestion.connectors.sqlite_connector import SQLiteConnector       # sqlite DB handler
from ingestion.pipeline import run_ingestion_pipeline                   # data processing pipeline
from ingestion.connectors.mongodb_connector import MongoDBConnector     # mongodb handler

router = APIRouter(prefix="/api", tags=["api"])   # all routes start with /api


class DBConfig(BaseModel):                        # schema for incoming DB config
    type: str                                    # DB type (postgres/mysql/etc)
    host: str | None = None                      # DB host (optional)
    port: int | None = None                      # DB port (optional)
    user: str | None = None                      # username (optional)
    password: str | None = None                  # password (optional)
    database: str | None = None                  # DB name (optional)
    path: str | None = None                      # file path (for sqlite)


@router.post("/data-source/test")
def test_connection(config: DBConfig):            # API to test DB connection
    try:
        if config.type == "postgres":
            conn = PostgresConnector(config.dict())   # create postgres connection
        elif config.type == "mysql":
            conn = MySQLConnector(config.dict())      # create mysql connection
        elif config.type == "sqlite":
            conn = SQLiteConnector({"path": config.path})  # sqlite uses file path
        elif config.type == "mongodb":
            conn = MongoDBConnector(config.dict())    # mongodb connection
        else:
            return {"error": "Unsupported DB"}        # invalid DB type

        conn.connect()                                # open connection
        conn.close()                                  # close immediately (just testing)

        return {"status": "connected"}                # success response

    except Exception as e:
        return {"status": "failed", "error": str(e)}  # return error if failed
    


@router.post("/data-source/ingest")
def ingest_from_db(config: DBConfig, query: str):    # API to fetch + process data

    if config.type == "postgres":
        conn = PostgresConnector(config.dict())      # postgres connection
    elif config.type == "mysql":
        conn = MySQLConnector(config.dict())         # mysql connection
    else:
        return {"error": "Unsupported"}              # only these two supported

    conn.connect()                                  # open connection
    df = conn.fetch(query)                          # run query → get data (DataFrame)
    conn.close()                                    # close connection

    result = run_ingestion_pipeline(df)              # process data

    return result                                   # return processed output


@router.post("/data-source/tables")
def list_tables(config: DBConfig):                  # API to list tables
    try:
        if config.type == "postgres":
            conn = PostgresConnector(config.dict())
            conn.connect()
            tables = conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")  # get tables
            conn.close()
            return {"tables": tables["table_name"].tolist()}  # convert to list

        elif config.type == "mysql":
            conn = MySQLConnector(config.dict())
            conn.connect()
            tables = conn.fetch("SHOW TABLES")      # mysql query for tables
            conn.close()
            return {"tables": tables.iloc[:, 0].tolist()}  # first column

        elif config.type == "sqlite":
            conn = SQLiteConnector({"path": config.path})
            conn.connect()
            tables = conn.fetch("SELECT name FROM sqlite_master WHERE type='table';")  # sqlite schema
            conn.close()
            return {"tables": tables["name"].tolist()}

        elif config.type == "mongodb":
            conn = MongoDBConnector({
                "uri": config.uri,
                "database": config.database
            })
            conn.connect()
            collections = conn.db.list_collection_names()  # mongodb collections
            conn.close()
            return {"tables": collections}

        else:
            return {"error": "Unsupported DB"}

    except Exception as e:
        return {"error": str(e)}
    

@router.post("/data-source/preview")
def preview_table(config: DBConfig, table: str):   # API to preview first 5 rows
    try:
        if config.type == "mongodb":
            conn = MongoDBConnector({
                "uri": config.uri,
                "database": config.database
            })
            conn.connect()
            data = list(conn.db[table].find().limit(5))  # get 5 docs
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
            df = conn.fetch(f"SELECT * FROM {table} LIMIT 5")  # fetch 5 rows
            conn.close()
            return {"rows": df.to_dict(orient="records")}  # convert to JSON

    except Exception as e:
        return {"error": str(e)}
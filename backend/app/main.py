import os
from fastapi import FastAPI
from psycopg_pool import ConnectionPool

DATABASE_URL = os.getenv("DATABASE_URL")
pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10)

app = FastAPI(title="ARCHIVE // 01 API", docs_url=None, redoc_url=None)

@app.get("/api/assets")
def list_assets():
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT asset_tag, serial_number, model_name, category, host(ip_address), status
                FROM hardware_assets
                ORDER BY created_at DESC LIMIT 50
            """)
            rows = cur.fetchall()
    return [
        {
            "tag": r[0],
            "serial": r[1],
            "model": r[2],
            "category": r[3],
            "ip": r[4],
            "status": r[5]
        }
        for r in rows
    ]


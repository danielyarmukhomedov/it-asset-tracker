import os
from fastapi import FastAPI
from psycopg_pool import ConnectionPool

DATABASE_URL = os.getenv("DATABASE_URL")
pool = ConnectionPool(conninfo=DATABASE_URL, min_size=1, max_size=10)

app = FastAPI(title="ARCHIVE // 01 API", docs_url=None, redoc_url=None)

@app.get("/api/health")
def health_check():
    with pool.connection() as conn:
        conn.execute("SELECT 1")
    return {"status": "OPERATIONAL"}

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
        {"tag": r, "serial": r, "model": r, "category": r, "ip": r, "status": r}
        for r in rows
    ]

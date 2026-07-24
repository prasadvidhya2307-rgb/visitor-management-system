import mysql.connector
from config import Config

def get_db():
    conn = mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB
    )
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SHOW TABLES")
    tables = [t[0] for t in cursor.fetchall()]
    
    if 'employees' not in tables:
        with open('schema.sql', 'r') as f:
            sql = f.read()
            for statement in sql.split(';'):
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
        conn.commit()
    
    cursor.close()
    conn.close()

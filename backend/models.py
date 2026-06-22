import os
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

# SQLite database setup
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'datavista.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT,
            subtitle TEXT,
            file_path TEXT,
            chart_dir TEXT,
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Initialize DB on load
init_db()

class User(UserMixin):
    def __init__(self, user_dict):
        self.id = str(user_dict.get('id') or user_dict.get('_id'))
        self.username = user_dict['username']
        self.email = user_dict.get('email', '')
        self.password_hash = user_dict['password_hash']
        self.created_at = user_dict.get('created_at')

    @staticmethod
    def get_by_id(user_id):
        try:
            conn = get_db_connection()
            user_row = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
            conn.close()
            if user_row:
                return User(dict(user_row))
        except Exception:
            return None
        return None

    @staticmethod
    def get_by_username(username):
        conn = get_db_connection()
        user_row = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        if user_row:
            return User(dict(user_row))
        return None

    @staticmethod
    def create(username, email, password):
        conn = get_db_connection()
        user_row = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        if user_row:
            conn.close()
            return None
            
        password_hash = generate_password_hash(password)
        created_at = datetime.utcnow().isoformat()
        
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
            (username, email, password_hash, created_at)
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        new_user = conn.execute('SELECT * FROM users WHERE id = ?', (new_id,)).fetchone()
        conn.close()
        return User(dict(new_user))

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class ReportModel:
    @staticmethod
    def create(user_id, title, subtitle, file_path, chart_dir):
        conn = get_db_connection()
        cursor = conn.cursor()
        created_at = datetime.utcnow().isoformat()
        
        cursor.execute(
            'INSERT INTO reports (user_id, title, subtitle, file_path, chart_dir, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            (str(user_id), title, subtitle, file_path, chart_dir, created_at)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return str(new_id)

    @staticmethod
    def get_by_user(user_id):
        conn = get_db_connection()
        reports = conn.execute(
            'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
            (str(user_id),)
        ).fetchall()
        conn.close()
        
        result = []
        for r in reports:
            row_dict = dict(r)
            row_dict['_id'] = str(row_dict.pop('id')) # Convert 'id' to '_id' for frontend
            result.append(row_dict)
        return result

import os
import sys

# Add the project root to the python path so the backend package can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from web_server import DataVistaRequestHandler

# Vercel expects an HTTP handler named `handler`
class handler(DataVistaRequestHandler):
    pass

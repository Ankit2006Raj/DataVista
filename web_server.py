#!/usr/bin/env python3
"""
DataVista Web Server
Serves the professional web interface and handles report generation
"""

import os
import sys
import json
import threading
import functools
import io
import tempfile
from email import message_from_binary_file
from email.parser import BytesParser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from datetime import datetime
from backend.data_analyzer import DataAnalyzer
from backend.report_generator import PDFReportGenerator

class DataVistaRequestHandler(SimpleHTTPRequestHandler):
    """Custom HTTP request handler for DataVista"""
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self.path = '/frontend/index.html'
        elif self.path in ['/styles.css', '/app.js', '/index.html', '/favicon.png', '/footer-styles.css']:
            self.path = '/frontend' + self.path.replace('/frontend', '')
        return super().do_GET()
    
    def do_POST(self):
        """Handle POST requests for report generation"""
        if self.path == '/api/generate-report':
            self.handle_report_generation()
        else:
            self.send_error(404)
    
    def parse_multipart_form_data(self):
        """Parse multipart/form-data without using deprecated cgi module"""
        content_type = self.headers.get('Content-Type', '')
        if 'multipart/form-data' not in content_type:
            return None, None
        
        # Extract boundary
        boundary = None
        for part in content_type.split(';'):
            if 'boundary=' in part:
                boundary = part.split('boundary=')[1].strip()
                break
        
        if not boundary:
            return None, None
        
        # Read the body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        # Parse multipart data
        parts = body.split(f'--{boundary}'.encode())
        form_data = {}
        file_data = None
        
        for part in parts:
            if not part or part == b'--\r\n' or part == b'--':
                continue
            
            # Split headers and content
            if b'\r\n\r\n' in part:
                headers_part, content = part.split(b'\r\n\r\n', 1)
                content = content.rstrip(b'\r\n')
                
                # Parse Content-Disposition
                headers_str = headers_part.decode('utf-8', errors='ignore')
                
                if 'Content-Disposition' in headers_str:
                    # Extract field name
                    name_match = headers_str.split('name="')
                    if len(name_match) > 1:
                        field_name = name_match[1].split('"')[0]
                        
                        # Check if it's a file
                        if 'filename="' in headers_str:
                            filename_match = headers_str.split('filename="')
                            if len(filename_match) > 1:
                                filename = filename_match[1].split('"')[0]
                                file_data = {
                                    'filename': filename,
                                    'content': content
                                }
                        else:
                            # Regular form field
                            form_data[field_name] = content.decode('utf-8', errors='ignore')
        
        return form_data, file_data
    
    def handle_report_generation(self):
        """Handle report generation request with file upload"""
        try:
            print("[*] Received report generation request")
            
            # Parse form data
            form_data, file_data = self.parse_multipart_form_data()
            
            if not file_data or not file_data.get('filename'):
                self.send_json_response({'error': 'No file uploaded'}, 400)
                return
            
            print(f"[*] File received: {file_data['filename']}")
            
            # Save the file to a temporary directory (Vercel compatible)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            temp_dir = tempfile.gettempdir()
            upload_dir = os.path.join(temp_dir, "data")
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
            
            safe_filename = f"upload_{timestamp}_{os.path.basename(file_data['filename'])}"
            file_path = os.path.join(upload_dir, safe_filename)
            
            with open(file_path, 'wb') as f:
                f.write(file_data['content'])
            
            print(f"[*] File saved to: {file_path}")
            
            # Get other form fields
            report_title = form_data.get('title', 'Professional Data Analysis Report')
            report_subtitle = form_data.get('subtitle', 'Comprehensive Analysis & Insights')
            
            print(f"[*] Starting analysis...")
            
            # Generate report
            output_dir = os.path.join(temp_dir, "output")
            if not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            output_pdf = os.path.join(output_dir, f"report_{timestamp}.pdf")
            chart_dir = os.path.join(output_dir, f"charts_{timestamp}")
            
            # Run analysis
            analyzer = DataAnalyzer(file_path)
            analysis_results = analyzer.perform_analysis()
            print(f"[*] Analysis complete")
            
            analyzer.generate_charts(chart_dir)
            print(f"[*] Charts generated")
            
            # Generate PDF
            report_gen = PDFReportGenerator(output_pdf)
            report_gen.add_title_page(report_title, report_subtitle, datetime.now().strftime("%B %d, %Y"))
            report_gen.add_executive_summary(analysis_results)
            report_gen.add_numeric_analysis(analysis_results)
            report_gen.add_categorical_analysis(analysis_results)
            report_gen.add_correlations(analysis_results)
            report_gen.add_visualizations(chart_dir)
            report_gen.add_conclusions()
            report_gen.build()
            
            print(f"[✓] Report generated: {output_pdf}")
            
            # Read the PDF and convert to base64
            import base64
            with open(output_pdf, "rb") as pdf_file:
                encoded_string = base64.b64encode(pdf_file.read()).decode('utf-8')
            
            self.send_json_response({
                'success': True,
                'report_base64': encoded_string,
                'filename': f"report_{timestamp}.pdf",
                'message': 'Report generated successfully'
            })
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            self.send_json_response({'error': str(e)}, 500)
    
    def send_json_response(self, data, status_code=200):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def run_server(port=8000):
    """Run the DataVista web server"""
    server_address = ('', port)
    # Serve from current directory (root) so we can access data, output, and frontend
    # We will handle the redirection to frontend/index.html in do_GET
    httpd = HTTPServer(server_address, DataVistaRequestHandler)
    
    print(f"""
    ╔════════════════════════════════════════════════════════════╗
    ║          DATAVISTA - WEB SERVER STARTED                    ║
    ║                                                            ║
    ║  📊 Enterprise-Grade Data Analytics & Reporting           ║
    ║                                                            ║
    ║  Server running at: http://localhost:{port}                ║
    ║                                                            ║
    ║  Press Ctrl+C to stop the server                          ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n[*] Shutting down server...")
        httpd.shutdown()
        print("[✓] Server stopped")

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)

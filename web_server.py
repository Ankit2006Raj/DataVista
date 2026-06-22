#!/usr/bin/env python3
"""
DataVista Flask Web Server
Serves the professional web interface and handles report generation
"""

import os
import sys
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_login import LoginManager, login_required, current_user

from backend.data_analyzer import DataAnalyzer
from backend.report_generator import PDFReportGenerator
from backend.models import User, ReportModel
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure Cloudinary
cloudinary.config( 
  cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.environ.get("CLOUDINARY_API_KEY"), 
  api_secret = os.environ.get("CLOUDINARY_API_SECRET"),
  secure = True
)
from backend.auth import auth_bp

app = Flask(__name__, static_folder='frontend')
secret = os.environ.get('SECRET_KEY')
if not secret:
    # Generate a random fallback for local testing, but warn loudly
    print("WARNING: No SECRET_KEY set in environment! Using a temporary random key.")
    secret = os.urandom(24)
app.secret_key = secret

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'You must be logged in to access this resource'}), 401

# Register Blueprints
app.register_blueprint(auth_bp)

# --- STATIC FILE ROUTES ---

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    return jsonify({'error': 'File not found'}), 404

# Serve generated output files (PDFs and Charts)
@app.route('/output/<path:path>')
def serve_output(path):
    # In a production app, you might want to add @login_required here and check if the user owns the file
    return send_from_directory('output', path)

# --- API ROUTES ---

@app.route('/api/my-reports', methods=['GET'])
@login_required
def get_my_reports():
    reports = ReportModel.get_by_user(current_user.id)
    return jsonify({'reports': reports}), 200

@app.route('/api/generate-report', methods=['POST'])
@login_required
def generate_report():
    try:
        print("[*] Received report generation request from user:", current_user.username)
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
            
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400

        print(f"[*] File received: {file.filename}")
        
        import tempfile
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Use a temporary directory that will be automatically deleted when the block exits
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, file.filename)
            file.save(file_path)
            
            print(f"[*] File saved temporarily to: {file_path}")
            
            # Get other form fields
            report_title = request.form.get('title', 'Professional Data Analysis Report')
            report_subtitle = request.form.get('subtitle', 'Comprehensive Analysis & Insights')
            
            print(f"[*] Starting analysis...")
            
            output_pdf = os.path.join(temp_dir, f"report_{timestamp}.pdf")
            chart_dir = os.path.join(temp_dir, f"charts_{timestamp}")
            os.makedirs(chart_dir, exist_ok=True)
            
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
            
            print(f"[✓] Report generated locally: {output_pdf}")
            
            try:
                import cloudinary.utils
                # Upload to Cloudinary
                print("[*] Uploading report to Cloudinary...")
                upload_result = cloudinary.uploader.upload(
                    output_pdf,
                    resource_type="image",
                    public_id=f"reports/report_{timestamp}"
                )
                
                # Generate a signed URL to bypass Cloudinary's default PDF security block
                web_pdf_path, _ = cloudinary.utils.cloudinary_url(
                    upload_result['public_id'], 
                    resource_type="image",
                    format="pdf",
                    sign_url=True
                )
                print(f"[✓] Successfully uploaded to Cloudinary (Signed): {web_pdf_path}")
                
                # Save to database (chart_dir is empty because we don't serve charts directly in production)
                ReportModel.create(
                    user_id=current_user.id,
                    title=report_title,
                    subtitle=report_subtitle,
                    file_path=web_pdf_path,
                    chart_dir=""
                )
                
                return jsonify({
                    'success': True,
                    'report': web_pdf_path,
                    'charts': "",
                    'message': 'Report generated successfully'
                })
            except Exception as e:
                print(f"[ERROR] Upload or Database Error: {str(e)}")
                return jsonify({'error': f'Server Error: {str(e)}'}), 500
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    print(f"""
    ╔════════════════════════════════════════════════════════════╗
    ║          DATAVISTA - FLASK WEB SERVER STARTED              ║
    ║                                                            ║
    ║  📊 Enterprise-Grade Data Analytics & Reporting           ║
    ║  🔒 Authentication & MongoDB Enabled                       ║
    ║                                                            ║
    ║  Server running at: http://localhost:{port}                ║
    ║                                                            ║
    ║  Press Ctrl+C to stop the server                          ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    # Run server (in production, use Gunicorn or Waitress)
    app.run(host='0.0.0.0', port=port, debug=True)

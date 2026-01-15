#!/usr/bin/env python3
"""
Automated Report Generation Script
Generates comprehensive PDF reports from CSV data files
"""

import argparse
import sys
import os
from datetime import datetime
from backend.data_analyzer import DataAnalyzer
from backend.report_generator import PDFReportGenerator

def main():
    parser = argparse.ArgumentParser(
        description='Generate professional PDF reports from CSV data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_report.py data/train.csv
  python generate_report.py data/train.csv -o output/my_report.pdf
  python generate_report.py data/train.csv -o output/my_report.pdf -c output/my_charts
        """
    )
    
    parser.add_argument('input_file', help='Input CSV file path')
    parser.add_argument('-o', '--output', default=None, help='Output PDF file path (default: output/report_TIMESTAMP.pdf)')
    parser.add_argument('-c', '--charts', default=None, help='Charts directory (default: output/charts_TIMESTAMP)')
    parser.add_argument('-v', '--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    # Validate input file
    if not os.path.exists(args.input_file):
        # Check in data directory
        data_path = os.path.join('data', args.input_file)
        if os.path.exists(data_path):
            args.input_file = data_path
        else:
            print(f"❌ Error: Input file '{args.input_file}' not found!")
            sys.exit(1)
    
    # Ensure output directory exists
    output_dir = "output"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Set output file
    if args.output is None:
        output_pdf = os.path.join(output_dir, f"report_{timestamp}.pdf")
    else:
        output_pdf = args.output
        # Ensure directory for output file exists
        os.makedirs(os.path.dirname(os.path.abspath(output_pdf)), exist_ok=True)
    
    if args.charts is None:
        chart_dir = os.path.join(output_dir, f"charts_{timestamp}")
    else:
        chart_dir = args.charts
    
    print("=" * 70)
    print("🚀 DATAVISTA - PROFESSIONAL REPORT GENERATOR")
    print("=" * 70)
    print(f"📁 Input File: {args.input_file}")
    print(f"📄 Output PDF: {output_pdf}")
    print(f"📊 Charts Directory: {chart_dir}")
    print("=" * 70)
    
    try:
        # Step 1: Initialize analyzer
        print("\n[1/5] Initializing data analyzer...")
        analyzer = DataAnalyzer(args.input_file)
        print("      ✓ Analyzer initialized")
        
        # Step 2: Perform analysis
        print("\n[2/5] Performing comprehensive data analysis...")
        analysis_results = analyzer.perform_analysis()
        print("      ✓ Analysis completed")
        
        if args.verbose:
            print("\n      Analysis Results Summary:")
            basic_stats = analysis_results['basic_stats']
            print(f"      - Total Records: {basic_stats['total_records']:,}")
            print(f"      - Total Sales: ${basic_stats['total_sales']:,.2f}")
            print(f"      - Average Sales: ${basic_stats['average_sales']:,.2f}")
            print(f"      - Unique Customers: {basic_stats['unique_customers']:,}")
            print(f"      - Unique Products: {basic_stats['unique_products']:,}")
        
        # Step 3: Generate visualizations
        print("\n[3/5] Generating visualizations and charts...")
        analyzer.generate_charts(chart_dir)
        print("      ✓ 10 professional charts generated")
        
        if args.verbose:
            charts = [f for f in os.listdir(chart_dir) if f.endswith('.png')]
            for chart in sorted(charts):
                print(f"      - {chart}")
        
        # Step 4: Create PDF report
        print("\n[4/5] Creating professional PDF report...")
        report_gen = PDFReportGenerator(output_pdf)
        
        # Add sections
        report_gen.add_title_page(
            "Professional Data Analysis Report",
            "Comprehensive Sales & Performance Analysis",
            datetime.now().strftime("%B %d, %Y")
        )
        print("      ✓ Title page added")
        
        report_gen.add_executive_summary(analysis_results)
        print("      ✓ Executive summary added")
        
        report_gen.add_numeric_analysis(analysis_results)
        print("      ✓ Numeric analysis added")
        
        report_gen.add_categorical_analysis(analysis_results)
        print("      ✓ Categorical analysis added")
        
        report_gen.add_correlations(analysis_results)
        print("      ✓ Correlation analysis added")
        
        report_gen.add_visualizations(chart_dir)
        print("      ✓ Visualizations added")
        
        report_gen.add_conclusions()
        print("      ✓ Conclusions added")
        
        # Step 5: Build PDF
        print("\n[5/5] Building and saving PDF...")
        report_gen.build()
        print("      ✓ PDF built successfully")
        
        # Success message
        print("\n" + "=" * 70)
        print("✅ REPORT GENERATION COMPLETED SUCCESSFULLY!")
        print("=" * 70)
        print(f"📄 Report saved to: {os.path.abspath(output_pdf)}")
        print(f"📊 Charts saved to: {os.path.abspath(chart_dir)}")
        print(f"⏱️  Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1

if __name__ == '__main__':
    sys.exit(main())

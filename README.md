# 📊 DataVista

<div align="center">

![DataVista Banner](https://img.shields.io/badge/DataVista-Enterprise%20Analytics-3498db?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgM1YyMUgyMVYzSDNaTTUgMTlWNUgxOVYxOUg1WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)

**Enterprise-Grade Data Analytics & Automated Reporting Platform**
https://data-vista-1sag.vercel.app/

Transform your CSV data into actionable insights with professional visualizations and comprehensive PDF reports

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Ankit2006Rajand)
[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-orange.svg)](https://github.com/Ankit2006Rajand)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---
<img width="1208" height="568" alt="image" src="https://github.com/user-attachments/assets/d7bc0f42-b173-4c0d-8db4-6994153a12cd" />
<img width="386" height="463" alt="image" src="https://github.com/user-attachments/assets/d1286e96-2409-4378-977e-6848cee17947" />



## 🎯 Overview

**DataVista** is a powerful, enterprise-grade data analytics platform that automatically generates comprehensive PDF reports from CSV data. Built for data scientists, analysts, and business professionals, it transforms complex datasets into clear, actionable insights with professional visualizations.

### ✨ Key Highlights

- 🚀 **Automated Analysis**: Upload CSV and get instant comprehensive analysis
- 📊 **10+ Visualization Types**: Including 3D charts, heatmaps, and interactive plots
- 📄 **Professional PDF Reports**: Branded, publication-ready reports with executive summaries
- 🎨 **Modern Web Interface**: Intuitive, responsive dashboard for seamless user experience
- ⚡ **Fast Processing**: Optimized algorithms handle datasets with millions of rows
- 🔒 **100% Local**: All data processing happens on your machine - complete privacy
- 🎯 **Zero Configuration**: Works out of the box with sensible defaults

---

## 🌟 Features

### 📈 Advanced Analytics

- **Statistical Analysis**: Mean, median, mode, standard deviation, quartiles
- **Correlation Analysis**: Identify relationships between variables
- **Distribution Analysis**: Understand data spread and patterns
- **Outlier Detection**: Automatically identify anomalies
- **Trend Analysis**: Discover temporal patterns and seasonality
- **Categorical Analysis**: Frequency distributions and top values

### 📊 Rich Visualizations

- **2D Charts**: Bar, line, scatter, pie, histogram, box plots
- **3D Visualizations**: Surface plots, 3D scatter, 3D bar charts
- **Heatmaps**: Correlation matrices and density plots
- **Distribution Plots**: KDE plots and violin plots
- **Time Series**: Trend lines and seasonal decomposition
- **Custom Styling**: Professional color schemes and branding

### 📄 Professional Reports

- **Executive Summary**: High-level overview with key metrics
- **Detailed Analysis**: In-depth statistical breakdowns
- **Visual Insights**: Embedded charts and graphs
- **Recommendations**: AI-generated actionable insights
- **Custom Branding**: DataVista professional styling

### 🎨 Modern Interface

- **Drag & Drop Upload**: Intuitive file handling
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Ready**: Eye-friendly interface
- **Interactive Dashboard**: Configure analysis parameters
- **Recent Reports**: Quick access to previous analyses

---

## 🚀 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/Ankit2006Rajand/DataVista.git
cd DataVista
```

2. **Create virtual environment** (recommended)
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python web_server.py
```

5. **Open your browser**
```
http://localhost:5000
```

That's it! 🎉 DataVista is now running on your machine.

---

## 📖 Usage

### Basic Workflow

1. **Upload CSV File**
   - Click the upload area or drag & drop your CSV file
   - Supports files up to 500MB
   - Ensure first row contains column headers

2. **Configure Settings**
   - Set report title and subtitle
   - Choose visualization options
   - Enable/disable 3D charts

3. **Generate Report**
   - Click "Generate Professional Report"
   - Monitor real-time progress
   - Wait for analysis completion

4. **View Results**
   - Open PDF report directly
   - Download for sharing
   - Access from recent reports list

### Command Line Usage

For advanced users, you can generate reports via command line:

```bash
python generate_report.py --input data/your_file.csv --output report.pdf
```

### API Usage

```python
from backend.data_analyzer import DataAnalyzer
from backend.report_generator import PDFReportGenerator

# Analyze data
analyzer = DataAnalyzer('data/your_file.csv')
results = analyzer.analyze()

# Generate report
pdf = PDFReportGenerator('output/report.pdf')
pdf.add_title_page("My Report", "Analysis Results", "2026-01-15")
pdf.add_executive_summary(results)
pdf.add_numeric_analysis(results)
pdf.add_visualizations('output/charts')
pdf.add_conclusions()
```

---

## 📁 Project Structure

```
DataVista/
├── backend/
│   ├── data_analyzer.py      # Core analysis engine
│   ├── report_generator.py   # PDF generation
│   └── __init__.py
├── frontend/
│   ├── index.html            # Main web interface
│   ├── app.js                # Frontend logic
│   ├── styles.css            # Styling
│   └── favicon.png           # App icon
├── data/
│   ├── config.json           # Configuration
│   └── *.csv                 # Sample datasets
├── output/
│   ├── charts/               # Generated visualizations
│   └── *.pdf                 # Generated reports
├── generate_report.py        # CLI script
├── web_server.py             # Flask web server
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

---

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computations
- **Matplotlib**: 2D visualizations
- **Seaborn**: Statistical visualizations
- **Flask**: Web server framework

### Frontend
- **HTML5**: Structure and semantics
- **CSS3**: Modern styling with animations
- **JavaScript (ES6+)**: Interactive functionality
- **Fetch API**: Asynchronous data handling

---

## 📊 Supported Data Types

DataVista automatically detects and analyzes:

- ✅ **Numeric**: Integers, floats, decimals
- ✅ **Categorical**: Strings, categories, labels
- ✅ **Temporal**: Dates, timestamps, time series
- ✅ **Boolean**: True/False, Yes/No, 1/0
- ✅ **Mixed**: Datasets with multiple data types

---

## 🎯 Use Cases

### For Data Analysts
- Quickly analyze large datasets
- Generate professional reports for stakeholders
- Identify trends and patterns
- Create data-driven recommendations

### For Data Scientists
- Exploratory data analysis (EDA)
- Statistical analysis and insights
- Baseline for advanced modeling
- Documentation and reporting

### For Business Professionals
- Understand business metrics
- Make informed decisions
- Present data to executives
- Track performance trends

### For Researchers
- Analyze research data
- Generate publication-ready reports
- Statistical validation
- Comparative analysis

---

## 🔧 Configuration

Edit `data/config.json` to customize:

```json
{
  "application": {
    "name": "DataVista",
    "version": "1.0.0"
  },
  "analysis": {
    "max_categorical_unique": 50,
    "correlation_threshold": 0.5,
    "outlier_method": "iqr"
  },
  "visualization": {
    "chart_style": "seaborn",
    "color_palette": "viridis",
    "figure_size": [10, 6]
  },
  "report": {
    "page_size": "A4",
    "include_toc": true,
    "branding": true
  }
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/DataVista.git

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run tests (if available)
python -m pytest

# Start development server
python web_server.py
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an issue on GitHub:

- [Report a Bug](https://github.com/Ankit2006Rajand/DataVista/issues/new?labels=bug)
- [Request a Feature](https://github.com/Ankit2006Rajand/DataVista/issues/new?labels=enhancement)

---

## 📧 Support

Need help? Reach out:

- 📧 Email: [ankit9905163014@gmail.com](mailto:ankit9905163014@gmail.com)
- 💼 LinkedIn: [Ankit Raj](https://www.linkedin.com/in/ankit-raj-226a36309)
- 🐙 GitHub: [@Ankit2006Rajand](https://github.com/Ankit2006Rajand)

---

## 👨‍💻 Author

<div align="center">

### **Ankit Raj**

[![GitHub](https://img.shields.io/badge/GitHub-Ankit2006Rajand-181717?style=for-the-badge&logo=github)](https://github.com/Ankit2006Rajand)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ankit%20Raj-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/ankit-raj-226a36309)
[![Email](https://img.shields.io/badge/Email-ankit9905163014@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ankit9905163014@gmail.com)

**Data Enthusiast | Python Developer | Analytics Expert**

*Passionate about transforming data into actionable insights and building tools that empower data-driven decision making.*

</div>

---

## 🌟 Acknowledgments

- Thanks to all contributors who have helped shape DataVista
- Inspired by the need for accessible, professional data analytics tools
- Built with ❤️ in India 🇮🇳

---

## 📈 Roadmap

### Version 2.0 (Upcoming)
- [ ] Machine Learning integration
- [ ] Real-time data streaming
- [ ] Cloud deployment options
- [ ] API endpoints for integration
- [ ] Multi-language support
- [ ] Advanced statistical tests
- [ ] Custom chart templates
- [ ] Collaborative features

### Version 1.5 (In Progress)
- [x] 3D visualizations
- [x] Enhanced PDF reports
- [x] Responsive web interface
- [ ] Export to Excel/CSV
- [ ] Scheduled reports
- [ ] Email notifications

---

## ⭐ Star History

If you find DataVista useful, please consider giving it a star! ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=Ankit2006Rajand/DataVista&type=Date)](https://star-history.com/#Ankit2006Rajand/DataVista&Date)

---

<div align="center">

## 💼 Connect With Me

<table>
  <tr>
    <td align="center" width="33%">
      <a href="https://github.com/Ankit2006Rajand" target="_blank">
        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
        <br />
        <strong>@Ankit2006Rajand</strong>
        <br />
        <sub>View My Projects</sub>
      </a>
    </td>
    <td align="center" width="33%">
      <a href="https://www.linkedin.com/in/ankit-raj-226a36309" target="_blank">
        <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
        <br />
        <strong>Ankit Raj</strong>
        <br />
        <sub>Let's Connect</sub>
      </a>
    </td>
    <td align="center" width="33%">
      <a href="mailto:ankit9905163014@gmail.com">
        <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
        <br />
        <strong>ankit9905163014@gmail.com</strong>
        <br />
        <sub>Get In Touch</sub>
      </a>
    </td>
  </tr>
</table>

---

### 👨‍💻 About the Developer

**Ankit Raj** | Data Enthusiast | Python Developer | Analytics Expert

*Passionate about transforming data into actionable insights and building tools that empower data-driven decision making.*

---

### 🤝 Support This Project

If DataVista has helped you in your work, consider:

- ⭐ **Star this repository** to show your support
- 🐛 **Report bugs** to help improve the project
- 💡 **Suggest features** to make it even better
- 🔀 **Contribute code** to join the development
- 📢 **Share with others** who might find it useful

---

### 📜 License & Copyright

<sub>© 2026 DataVista. All Rights Reserved.</sub>

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<sub>**Made with ❤️ in India 🇮🇳** | Crafted by [Ankit Raj](https://github.com/Ankit2006Rajand)</sub>

</div>
"# DataVista" 

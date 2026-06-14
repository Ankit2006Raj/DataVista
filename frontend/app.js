/* ============================================
   DATAVISTA - JAVASCRIPT APPLICATION
   ============================================ */

// Global Variables
let selectedFile = null;
let isProcessing = false;
let recentReports = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    loadRecentReports();
});

function initializeApp() {
    // File upload area
    const fileUploadArea = document.getElementById('fileUploadArea');
    const csvFile = document.getElementById('csvFile');

    // Click to upload
    fileUploadArea.addEventListener('click', () => csvFile.click());

    // Drag and drop
    fileUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.15)';
    });

    fileUploadArea.addEventListener('dragleave', () => {
        fileUploadArea.style.backgroundColor = '';
    });

    fileUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUploadArea.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    // File input change
    csvFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    // Navigation links
    setupNavigation();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu when a link is clicked
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });

    // Set home as active by default if on index.html
    const homeLink = document.querySelector('a[href="#home"]');
    if (homeLink) homeLink.classList.add('active');
}

function handleFileSelect(file) {
    // Validate file
    if (!file.name.endsWith('.csv')) {
        showError('Please select a valid CSV file');
        return;
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
        showError('File size exceeds 500MB limit');
        return;
    }

    selectedFile = file;
    updateFileDisplay();
    analyzeFileMetadata(file);
    enableGenerateButton();
}

function updateFileDisplay() {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');

    fileUploadArea.style.display = 'none';
    fileInfo.style.display = 'block';
    fileName.textContent = selectedFile.name;

    updateStatusMessage(`✓ File selected: ${selectedFile.name}`, 'success');
}

function analyzeFileMetadata(file) {
    // Read file to get metadata
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const content = e.target.result;
            const lines = content.split('\n');
            const rows = lines.filter(line => line.trim().length > 0).length - 1; // Exclude header
            const columns = lines[0].split(',').length;
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

            document.getElementById('statRows').textContent = rows.toLocaleString();
            document.getElementById('statColumns').textContent = columns;
            document.getElementById('statSize').textContent = sizeMB + ' MB';
            document.getElementById('statStatus').textContent = 'Ready';
        } catch (error) {
            console.error('Error analyzing file:', error);
        }
    };
    reader.readAsText(file);
}

function resetFile() {
    selectedFile = null;
    document.getElementById('csvFile').value = '';
    document.getElementById('fileUploadArea').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('statRows').textContent = '-';
    document.getElementById('statColumns').textContent = '-';
    document.getElementById('statSize').textContent = '-';
    document.getElementById('statStatus').textContent = '-';
    disableGenerateButton();
    updateStatusMessage('Ready to generate report', 'info');

    // Disable action buttons
    document.getElementById('openBtn').disabled = true;
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.disabled = true;
}

function enableGenerateButton() {
    document.getElementById('generateBtn').disabled = false;
}

function disableGenerateButton() {
    document.getElementById('generateBtn').disabled = true;
}

function generateReport() {
    if (!selectedFile) {
        showError('Please select a CSV file first');
        return;
    }

    if (isProcessing) {
        showError('Report generation already in progress');
        return;
    }

    isProcessing = true;
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('openBtn').disabled = true;
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.disabled = true;

    // Reset progress
    setProgress(10);
    updateStatusMessage('Uploading file and starting analysis...', 'info');

    // Create FormData
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', document.getElementById('reportTitle').value);
    formData.append('subtitle', document.getElementById('reportSubtitle').value);

    // Start progress simulation
    let simulatedProgress = 10;
    const progressInterval = setInterval(() => {
        simulatedProgress += Math.random() * 5;
        if (simulatedProgress > 90) simulatedProgress = 90;
        setProgress(simulatedProgress);

        const messages = [
            'Uploading file...',
            'Analyzing data structure...',
            'Processing columns...',
            'Calculating statistics...',
            'Generating visualizations...',
            'Creating charts...',
            'Building PDF report...',
            'Finalizing...'
        ];
        const msgIndex = Math.floor((simulatedProgress / 100) * (messages.length - 1));
        updateStatusMessage(messages[msgIndex], 'info');
    }, 800);

    // Send request
    fetch('/api/generate-report', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                }).catch(() => {
                    throw new Error(`Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            clearInterval(progressInterval);
            console.log('Response data received');
            if (data.success) {
                setProgress(100);
                completeReportGeneration(data);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        })
        .catch(error => {
            clearInterval(progressInterval);
            console.error('Error:', error);
            showError('Failed to generate report: ' + error.message);
            isProcessing = false;
            document.getElementById('generateBtn').disabled = false;
            setProgress(0);
            updateStatusMessage('Error: ' + error.message, 'error');
        });
}

function setProgress(value) {
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    if (progressBar && progressPercentage) {
        progressBar.style.width = value + '%';
        progressPercentage.textContent = Math.round(value) + '%';
    }
}

function completeReportGeneration(reportData) {
    isProcessing = false;

    // Extract filename and base64 string
    const reportName = reportData.filename || 'report.pdf';
    
    // Convert base64 to Blob URL
    const byteCharacters = atob(reportData.report_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    const reportUrl = URL.createObjectURL(blob);

    updateStatusMessage(`✓ Report generated successfully: ${reportName}`, 'success');

    const openBtn = document.getElementById('openBtn');
    openBtn.disabled = false;
    openBtn.onclick = () => window.open(reportUrl, '_blank');

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => triggerDownload(reportUrl, reportName);
    }

    document.getElementById('generateBtn').disabled = false;

    // Add to recent reports
    addRecentReport(reportName, reportUrl);

    // Show success notification
    showSuccess('Report generated successfully! Click "Open Report" to view it.');
}

function openReport() {
    if (recentReports.length > 0) {
        window.open(recentReports[0].path, '_blank');
    } else {
        showInfo('No report available to open');
    }
}

function downloadReport() {
    if (recentReports.length > 0) {
        const link = document.createElement('a');
        link.href = recentReports[0].path;
        link.download = recentReports[0].name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        showInfo('No report available to download');
    }
}

function addRecentReport(reportName, reportPath) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();

    recentReports.unshift({
        name: reportName,
        path: reportPath,
        date: dateString,
        time: timeString
    });

    // Keep only last 5 reports
    if (recentReports.length > 5) {
        recentReports.pop();
    }

    saveRecentReports();
    updateRecentReportsList();
}

function updateRecentReportsList() {
    const recentReportsList = document.getElementById('recentReports');

    if (recentReports.length === 0) {
        recentReportsList.innerHTML = '<p class="empty-message">No reports generated yet</p>';
        return;
    }

    recentReportsList.innerHTML = recentReports.map((report, index) => `
        <div class="report-item">
            <div>
                <div style="font-weight: 600; color: #2c3e50;">${report.name}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d;">${report.date} at ${report.time}</div>
            </div>
            <div class="report-actions">
                <button onclick="window.open('${report.path}', '_blank')" title="Open Report">📂</button>
                <button onclick="triggerDownload('${report.path}', '${report.name}')" title="Download Report">⬇️</button>
            </div>
        </div>
    `).join('');
}

function triggerDownload(path, name) {
    const link = document.createElement('a');
    link.href = path;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveRecentReports() {
    localStorage.setItem('datavista_recent_reports', JSON.stringify(recentReports));
}

function loadRecentReports() {
    const saved = localStorage.getItem('datavista_recent_reports');
    if (saved) {
        recentReports = JSON.parse(saved);
        updateRecentReportsList();
    }
}

function updateStatusMessage(message, type = 'info') {
    const statusMessage = document.getElementById('statusMessage');
    const statusDetails = document.getElementById('statusDetails');

    statusMessage.textContent = message;

    // Update styling based on type
    statusMessage.style.backgroundColor = getStatusColor(type);
    statusMessage.style.borderLeftColor = getStatusBorderColor(type);
    statusMessage.style.color = getStatusTextColor(type);
}

function getStatusColor(type) {
    const colors = {
        'success': 'rgba(39, 174, 96, 0.1)',
        'error': 'rgba(231, 76, 60, 0.1)',
        'warning': 'rgba(243, 156, 18, 0.1)',
        'info': 'rgba(52, 152, 219, 0.1)'
    };
    return colors[type] || colors['info'];
}

function getStatusBorderColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || colors['info'];
}

function getStatusTextColor(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || colors['info'];
}

function showError(message) {
    updateStatusMessage(message, 'error');
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${getNotificationBg(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationBg(type) {
    const colors = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    return colors[type] || colors['info'];
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

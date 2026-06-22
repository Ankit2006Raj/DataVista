/* ============================================
   DATAVISTA - JAVASCRIPT APPLICATION
   ============================================ */

// Global Variables
let selectedFile = null;
let isProcessing = false;
let recentReports = [];
let currentUser = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    loadRecentReports();
    checkAuthStatus();
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
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set home as active by default
    document.querySelector('a[href="#home"]').classList.add('active');
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
    if (!currentUser) {
        showAuthModal('login');
        showError('Please login to generate reports');
        return;
    }

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
            console.log('Response data:', data);
            if (data.success) {
                setProgress(100);
                completeReportGeneration(data.report);
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

function completeReportGeneration(reportPath) {
    isProcessing = false;

    // Extract filename from path
    const reportName = reportPath.split('/').pop();

    updateStatusMessage(`✓ Report generated successfully: ${reportName}`, 'success');

    const openBtn = document.getElementById('openBtn');
    openBtn.disabled = false;
    openBtn.onclick = () => window.open(reportPath, '_blank');

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.onclick = () => triggerDownload(reportPath, reportName);
    }

    document.getElementById('generateBtn').disabled = false;

    // Add to recent reports
    addRecentReport(reportName, reportPath);

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
        <div class="report-item" style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-light);">
            <div>
                <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; word-break: break-all;">${report.name}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${report.date} at ${report.time}</div>
            </div>
            <div class="report-actions" style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="btn-secondary" onclick="window.open('${report.path}', '_blank')" title="Open Report" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">📂 Open</button>
                <button class="btn-secondary" onclick="triggerDownload('${report.path}', '${report.name}')" title="Download Report" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">⬇️ Download</button>
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
        const href = this.getAttribute('href');
        if (href === '#') {
            e.preventDefault();
            return;
        }
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/* ============================================
   AUTHENTICATION LOGIC
   ============================================ */

let authMode = 'login'; // 'login' or 'register'

function showAuthModal(mode = 'login') {
    authMode = mode;
    document.getElementById('authModal').style.display = 'block';
    updateAuthUI();
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
    document.getElementById('authUsername').value = '';
    document.getElementById('authEmail').value = '';
    document.getElementById('authPassword').value = '';
}

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'register' : 'login';
    updateAuthUI();
}

function updateAuthUI() {
    const title = document.getElementById('authTitle');
    const emailGroup = document.getElementById('emailGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const toggleLink = document.getElementById('authToggleLink');

    if (authMode === 'login') {
        title.textContent = 'Login';
        emailGroup.style.display = 'none';
        submitBtn.textContent = 'Login';
        toggleLink.textContent = 'Need an account? Sign up';
    } else {
        title.textContent = 'Sign Up';
        emailGroup.style.display = 'block';
        submitBtn.textContent = 'Sign Up';
        toggleLink.textContent = 'Already have an account? Login';
    }
}

function submitAuth() {
    const username = document.getElementById('authUsername').value;
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (!username || !password) {
        showError('Please fill in all required fields');
        return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = { username, password };
    if (authMode === 'register') payload.email = email;

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200 || status === 201) {
            showSuccess(body.message);
            closeAuthModal();
            checkAuthStatus();
        } else {
            showError(body.error || 'Authentication failed');
        }
    })
    .catch(err => showError('Network error during authentication'));
}

function logoutUser() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            currentUser = null;
            showSuccess('Logged out successfully');
            updateNavigationUI();
            if(window.location.pathname.includes('reports.html')) {
                window.location.href = '/';
            }
        });
}

function checkAuthStatus() {
    fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
            if (data.authenticated) {
                currentUser = data.user;
                updateNavigationUI();
                fetchMyReports();
            } else {
                currentUser = null;
                updateNavigationUI();
            }
        });
}

function updateNavigationUI() {
    const loginBtn = document.getElementById('nav-login-btn');
    const profileMenu = document.getElementById('nav-profile-menu');

    if (currentUser) {
        if(loginBtn) loginBtn.style.display = 'none';
        if(profileMenu) {
            profileMenu.style.display = 'block';
            const initialObj = document.getElementById('profileInitial');
            if(initialObj && currentUser.username) {
                initialObj.innerText = currentUser.username.charAt(0).toUpperCase();
            }
        }
    } else {
        if(loginBtn) loginBtn.style.display = 'block';
        if(profileMenu) profileMenu.style.display = 'none';
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if(dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close dropdown if clicking outside
document.addEventListener('click', function(event) {
    const profileMenu = document.getElementById('nav-profile-menu');
    const dropdown = document.getElementById('profileDropdown');
    if (profileMenu && dropdown && !profileMenu.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

function fetchMyReports() {
    fetch('/api/my-reports')
        .then(res => {
            if(!res.ok) throw new Error("Failed to fetch");
            return res.json();
        })
        .then(data => {
            const list = document.getElementById('reportsList');
            if (data.reports && data.reports.length > 0) {
                list.innerHTML = data.reports.map(r => `
                    <div class="report-card">
                        <h4>${r.title}</h4>
                        <p>${new Date(r.created_at).toLocaleString()}</p>
                        <button class="btn-primary btn-sm" onclick="window.open('${r.file_path}', '_blank')">View PDF</button>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<p>No reports generated yet.</p>';
            }
        })
        .catch(err => console.log('Error fetching reports:', err));
}
// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
});

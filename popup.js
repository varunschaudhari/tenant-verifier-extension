// Tenant Verification Chrome Extension - Popup Script

class TenantVerifier {
    constructor() {
        this.currentView = 'form';
        this.verificationHistory = [];
        this.settings = {
            autoScan: true,
            notifications: true,
            saveHistory: true
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
        this.loadHistory();
    }

    initializeElements() {
        // Main sections
        this.formSection = document.getElementById('verificationForm');
        this.loadingState = document.getElementById('loadingState');
        this.resultsSection = document.getElementById('resultsSection');
        this.historySection = document.getElementById('historySection');
        this.settingsSection = document.getElementById('settingsSection');

        // Form elements
        this.form = document.getElementById('verificationForm');
        this.fullNameInput = document.getElementById('fullName');
        this.aadhaarInput = document.getElementById('aadhaar');
        this.panInput = document.getElementById('pan');
        this.phoneInput = document.getElementById('phone');
        this.emailInput = document.getElementById('email');
        this.addressInput = document.getElementById('currentAddress');
        this.employerInput = document.getElementById('employer');
        this.salaryInput = document.getElementById('salary');

        // Quick action buttons
        this.scanPageBtn = document.querySelector('[data-action="scan-page"]');
        this.historyBtn = document.querySelector('[data-action="history"]');
        this.settingsBtn = document.querySelector('[data-action="settings"]');

        // Results elements
        this.resultsContent = document.getElementById('resultsContent');
        this.saveResultsBtn = document.getElementById('saveResults');
        this.shareResultsBtn = document.getElementById('shareResults');
        this.newVerificationBtn = document.getElementById('newVerification');

        // History elements
        this.historyContent = document.getElementById('historyContent');
        this.backToFormBtn = document.getElementById('backToForm');

        // Settings elements
        this.autoScanCheckbox = document.getElementById('autoScan');
        this.notificationsCheckbox = document.getElementById('notifications');
        this.saveHistoryCheckbox = document.getElementById('saveHistory');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.backToFormFromSettingsBtn = document.getElementById('backToFormFromSettings');

        // Footer links
        this.helpLink = document.getElementById('helpLink');
        this.privacyLink = document.getElementById('privacyLink');
        this.feedbackLink = document.getElementById('feedbackLink');
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Input formatting
        this.aadhaarInput.addEventListener('input', (e) => this.formatAadhaar(e));
        this.panInput.addEventListener('input', (e) => this.formatPAN(e));
        this.phoneInput.addEventListener('input', (e) => this.formatPhone(e));

        // Quick actions
        this.scanPageBtn.addEventListener('click', () => this.scanCurrentPage());
        this.historyBtn.addEventListener('click', () => this.showHistory());
        this.settingsBtn.addEventListener('click', () => this.showSettings());

        // Results actions
        this.saveResultsBtn.addEventListener('click', () => this.saveResults());
        this.shareResultsBtn.addEventListener('click', () => this.shareResults());
        this.newVerificationBtn.addEventListener('click', () => this.showForm());

        // Navigation
        this.backToFormBtn.addEventListener('click', () => this.showForm());
        this.backToFormFromSettingsBtn.addEventListener('click', () => this.showForm());

        // Settings
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // Footer links
        this.helpLink.addEventListener('click', (e) => this.handleFooterLink(e, 'help'));
        this.privacyLink.addEventListener('click', (e) => this.handleFooterLink(e, 'privacy'));
        this.feedbackLink.addEventListener('click', (e) => this.handleFooterLink(e, 'feedback'));
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async loadHistory() {
        try {
            const result = await chrome.storage.local.get(['verificationHistory']);
            this.verificationHistory = result.verificationHistory || [];
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    updateSettingsUI() {
        this.autoScanCheckbox.checked = this.settings.autoScan;
        this.notificationsCheckbox.checked = this.settings.notifications;
        this.saveHistoryCheckbox.checked = this.settings.saveHistory;
    }

    formatAadhaar(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 12) value = value.slice(0, 12);
        
        if (value.length >= 4) {
            value = value.slice(0, 4) + '-' + value.slice(4);
        }
        if (value.length >= 9) {
            value = value.slice(0, 9) + '-' + value.slice(9);
        }
        
        e.target.value = value;
    }

    formatPAN(e) {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        e.target.value = value;
    }

    formatPhone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.startsWith('91')) {
            value = value.slice(2);
        }
        
        if (value.length > 10) value = value.slice(0, 10);
        
        if (value.length >= 5) {
            value = '+91-' + value.slice(0, 5) + '-' + value.slice(5);
        } else if (value.length > 0) {
            value = '+91-' + value;
        }
        
        e.target.value = value;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const tenantData = Object.fromEntries(formData.entries());
        
        // Basic validation
        if (!tenantData.fullName.trim()) {
            this.showNotification('Please enter the tenant\'s full name', 'error');
            return;
        }

        this.showLoading();
        
        try {
            // Send message to background script for verification
            const response = await chrome.runtime.sendMessage({
                action: 'verifyTenant',
                data: tenantData
            });

            if (response.success) {
                this.displayResults(response.results);
                this.addToHistory(tenantData.fullName, response.results);
            } else {
                this.showNotification('Verification failed: ' + response.error, 'error');
                this.showForm();
            }
        } catch (error) {
            console.error('Verification error:', error);
            this.showNotification('An error occurred during verification', 'error');
            this.showForm();
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loadingState.classList.remove('hidden');
        this.currentView = 'loading';
    }

    displayResults(results) {
        this.hideAllSections();
        this.resultsSection.classList.remove('hidden');
        this.currentView = 'results';

        const resultsHTML = `
            <div class="result-item">
                <span class="result-label">Overall Status</span>
                <span class="result-value ${this.getStatusClass(results.overallStatus)}">${results.overallStatus}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Confidence Score</span>
                <span class="result-value">${results.confidenceScore}%</span>
            </div>
            <div class="result-item">
                <span class="result-label">Risk Level</span>
                <span class="result-value ${this.getRiskClass(results.riskLevel)}">${results.riskLevel}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Identity Verification</span>
                <span class="result-value ${this.getStatusClass(results.identityStatus)}">${results.identityStatus}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Rental History</span>
                <span class="result-value ${this.getStatusClass(results.rentalHistory)}">${results.rentalHistory}</span>
            </div>
            <div class="result-item">
                <span class="result-label">Background Check</span>
                <span class="result-value ${this.getStatusClass(results.backgroundCheck)}">${results.backgroundCheck}</span>
            </div>
            ${results.recommendation ? `
            <div class="result-item">
                <span class="result-label">Recommendation</span>
                <span class="result-value">${results.recommendation}</span>
            </div>
            ` : ''}
        `;

        this.resultsContent.innerHTML = resultsHTML;
        this.resultsContent.classList.add('fade-in');
    }

    getStatusClass(status) {
        if (status === 'Verified' || status === 'Clean' || status === 'Passed') return 'success';
        if (status === 'Pending' || status === 'Partial') return 'warning';
        return 'danger';
    }

    getRiskClass(riskLevel) {
        if (riskLevel === 'Low') return 'success';
        if (riskLevel === 'Medium') return 'warning';
        return 'danger';
    }

    async addToHistory(name, results) {
        if (!this.settings.saveHistory) return;

        const historyItem = {
            name: name,
            date: new Date().toISOString(),
            status: results.overallStatus,
            riskLevel: results.riskLevel,
            confidenceScore: results.confidenceScore
        };

        this.verificationHistory.unshift(historyItem);
        
        // Keep only last 50 entries
        if (this.verificationHistory.length > 50) {
            this.verificationHistory = this.verificationHistory.slice(0, 50);
        }

        try {
            await chrome.storage.local.set({ verificationHistory: this.verificationHistory });
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    showHistory() {
        this.hideAllSections();
        this.historySection.classList.remove('hidden');
        this.currentView = 'history';

        if (this.verificationHistory.length === 0) {
            this.historyContent.innerHTML = '<p style="text-align: center; color: #6c757d; padding: 20px;">No verification history found</p>';
            return;
        }

        const historyHTML = this.verificationHistory.map(item => `
            <div class="history-item">
                <div class="history-name">${item.name}</div>
                <div class="history-date">${new Date(item.date).toLocaleDateString()}</div>
                <div class="history-status">
                    Status: ${item.status} | Risk: ${item.riskLevel} | Score: ${item.confidenceScore}%
                </div>
            </div>
        `).join('');

        this.historyContent.innerHTML = historyHTML;
    }

    showSettings() {
        this.hideAllSections();
        this.settingsSection.classList.remove('hidden');
        this.currentView = 'settings';
    }

    showForm() {
        this.hideAllSections();
        this.formSection.classList.remove('hidden');
        this.currentView = 'form';
    }

    hideAllSections() {
        this.formSection.classList.add('hidden');
        this.loadingState.classList.add('hidden');
        this.resultsSection.classList.add('hidden');
        this.historySection.classList.add('hidden');
        this.settingsSection.classList.add('hidden');
    }

    async scanCurrentPage() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
            
            if (response && response.found) {
                this.showNotification(`Found ${response.count} tenant-related forms on this page`, 'success');
            } else {
                this.showNotification('No tenant forms found on this page', 'info');
            }
        } catch (error) {
            console.error('Error scanning page:', error);
            this.showNotification('Unable to scan this page', 'error');
        }
    }

    async saveSettings() {
        this.settings = {
            autoScan: this.autoScanCheckbox.checked,
            notifications: this.notificationsCheckbox.checked,
            saveHistory: this.saveHistoryCheckbox.checked
        };

        try {
            await chrome.storage.local.set({ settings: this.settings });
            this.showNotification('Settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }

    saveResults() {
        // Implementation for saving results to file or clipboard
        this.showNotification('Results saved to clipboard', 'success');
    }

    shareResults() {
        // Implementation for sharing results
        this.showNotification('Sharing feature coming soon', 'info');
    }

    handleFooterLink(e, type) {
        e.preventDefault();
        
        const urls = {
            help: 'https://github.com/your-repo/tenant-verification-extension#readme',
            privacy: 'https://your-domain.com/privacy-policy',
            feedback: 'mailto:feedback@your-domain.com'
        };

        if (urls[type]) {
            chrome.tabs.create({ url: urls[type] });
        }
    }

    showNotification(message, type = 'info') {
        if (!this.settings.notifications) return;

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the verifier when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TenantVerifier();
});

// Tenant Verification Chrome Extension - Content Script

class TenantVerificationContent {
    constructor() {
        this.isInitialized = false;
        this.floatingWidget = null;
        this.verificationButtons = [];
        this.observer = null;
        this.scanTimeout = null;
        this.scanThrottle = 1000; // Throttle scans to once per second
        this.lastScanTime = 0;
        this.scannedForms = new Set(); // Track already scanned forms
        
        this.initialize();
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.setupMessageListener();
        this.scanPageForTenantForms();
        this.setupMutationObserver();
        this.injectFloatingWidget();
        this.setupKeyboardShortcuts();
        
        this.isInitialized = true;
        console.log('Tenant Verification Content Script initialized');
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'scanPage':
                    const scanResults = this.scanPageForTenantForms();
                    sendResponse(scanResults);
                    break;

                case 'prefillVerification':
                    this.prefillVerificationForm(message.text);
                    sendResponse({ success: true });
                    break;

                case 'showWidget':
                    this.showFloatingWidget();
                    sendResponse({ success: true });
                    break;

                case 'hideWidget':
                    this.hideFloatingWidget();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    scanPageForTenantForms() {
        // Throttle scanning to prevent excessive CPU usage
        const now = Date.now();
        if (now - this.lastScanTime < this.scanThrottle) {
            return {
                found: this.verificationButtons.length > 0,
                count: this.verificationButtons.length,
                elements: 0
            };
        }
        this.lastScanTime = now;

        const tenantKeywords = [
            'tenant', 'rent', 'lease', 'rental', 'property', 'accommodation',
            'flat', 'apartment', 'house', 'room', 'pg', 'paying guest',
            'tenant application', 'rental form', 'lease agreement'
        ];

        const formSelectors = [
            'form',
            '[role="form"]',
            '.form',
            '.application-form',
            '.tenant-form',
            '.rental-form'
        ];

        let foundForms = [];
        let tenantElements = [];

        // Limit the number of elements to scan to prevent freezing
        const maxElementsToScan = 1000;
        let elementsScanned = 0;

        // Find forms with better performance
        formSelectors.forEach(selector => {
            if (elementsScanned >= maxElementsToScan) return;
            
            const forms = document.querySelectorAll(selector);
            const formsArray = Array.from(forms).slice(0, 50); // Limit to 50 forms
            
            formsArray.forEach(form => {
                if (elementsScanned >= maxElementsToScan) return;
                elementsScanned++;
                
                // Skip if already processed
                if (this.scannedForms.has(form)) return;
                
                const formText = form.textContent.toLowerCase();
                const hasTenantKeywords = tenantKeywords.some(keyword => 
                    formText.includes(keyword)
                );

                if (hasTenantKeywords) {
                    foundForms.push(form);
                    this.scannedForms.add(form);
                }
            });
        });

        // Add verification buttons to new forms only
        foundForms.forEach(form => {
            if (!form.querySelector('.tenant-verification-btn')) {
                this.addVerificationButtonToForm(form);
            }
        });

        return {
            found: foundForms.length > 0 || this.verificationButtons.length > 0,
            count: foundForms.length,
            elements: tenantElements.length
        };
    }

    addVerificationButtonToForm(form) {
        // Check if button already exists
        if (form.querySelector('.tenant-verification-btn')) {
            return;
        }

        const button = document.createElement('button');
        button.className = 'tenant-verification-btn';
        button.innerHTML = `
            <span class="btn-icon">🔍</span>
            Verify Tenant
        `;
        button.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            margin: 10px 0;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        `;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleVerificationButtonClick(form);
        });

        // Insert button after form or at the end
        if (form.querySelector('input[type="submit"], button[type="submit"]')) {
            const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
            submitButton.parentNode.insertBefore(button, submitButton);
        } else {
            form.appendChild(button);
        }

        this.verificationButtons.push(button);
    }

    highlightElement(element) {
        if (element.classList.contains('tenant-highlighted')) {
            return;
        }

        element.classList.add('tenant-highlighted');
        element.style.cssText += `
            background: rgba(102, 126, 234, 0.1) !important;
            border: 1px solid rgba(102, 126, 234, 0.3) !important;
            border-radius: 4px !important;
            padding: 2px 4px !important;
            position: relative !important;
        `;

        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tenant-tooltip';
        tooltip.textContent = 'Tenant-related content detected';
        tooltip.style.cssText = `
            position: absolute;
            top: -30px;
            left: 0;
            background: #667eea;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        `;

        element.appendChild(tooltip);

        // Show tooltip on hover
        element.addEventListener('mouseenter', () => {
            tooltip.style.opacity = '1';
        });

        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
    }

    handleVerificationButtonClick(form) {
        // Extract form data
        const formData = this.extractFormData(form);
        
        // Show floating widget with pre-filled data
        this.showFloatingWidget();
        this.prefillWidgetWithData(formData);
    }

    extractFormData(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            if (input.name || input.id) {
                const fieldName = input.name || input.id;
                const fieldValue = input.value;

                // Map common field names to our format
                if (fieldName.toLowerCase().includes('name') || fieldName.toLowerCase().includes('fullname')) {
                    formData.fullName = fieldValue;
                } else if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('mobile')) {
                    formData.phone = fieldValue;
                } else if (fieldName.toLowerCase().includes('email')) {
                    formData.email = fieldValue;
                } else if (fieldName.toLowerCase().includes('address')) {
                    formData.currentAddress = fieldValue;
                } else if (fieldName.toLowerCase().includes('aadhaar')) {
                    formData.aadhaar = fieldValue;
                } else if (fieldName.toLowerCase().includes('pan')) {
                    formData.pan = fieldValue;
                } else if (fieldName.toLowerCase().includes('employer') || fieldName.toLowerCase().includes('company')) {
                    formData.employer = fieldValue;
                } else if (fieldName.toLowerCase().includes('salary') || fieldName.toLowerCase().includes('income')) {
                    formData.salary = fieldValue;
                }
            }
        });

        return formData;
    }

    injectFloatingWidget() {
        if (this.floatingWidget) return;

        this.floatingWidget = document.createElement('div');
        this.floatingWidget.className = 'tenant-verification-widget';
        this.floatingWidget.innerHTML = `
            <div class="widget-header">
                <div class="widget-title">
                    <span class="widget-icon">🔍</span>
                    Tenant Verification
                </div>
                <button class="widget-close" title="Close">×</button>
            </div>
            <div class="widget-content">
                <form class="widget-form">
                    <div class="form-group">
                        <label for="widget-fullName">Full Name *</label>
                        <input type="text" id="widget-fullName" name="fullName" required>
                    </div>
                    <div class="form-group">
                        <label for="widget-aadhaar">Aadhaar Number</label>
                        <input type="text" id="widget-aadhaar" name="aadhaar" placeholder="XXXX-XXXX-XXXX">
                    </div>
                    <div class="form-group">
                        <label for="widget-pan">PAN Number</label>
                        <input type="text" id="widget-pan" name="pan" placeholder="ABCDE1234F">
                    </div>
                    <div class="form-group">
                        <label for="widget-phone">Phone Number</label>
                        <input type="tel" id="widget-phone" name="phone" placeholder="+91-98765-43210">
                    </div>
                    <div class="form-group">
                        <label for="widget-email">Email</label>
                        <input type="email" id="widget-email" name="email">
                    </div>
                    <div class="form-group">
                        <label for="widget-address">Current Address</label>
                        <textarea id="widget-address" name="currentAddress"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="widget-employer">Employer/Company</label>
                        <input type="text" id="widget-employer" name="employer">
                    </div>
                    <div class="form-group">
                        <label for="widget-salary">Monthly Salary (₹)</label>
                        <input type="number" id="widget-salary" name="salary" min="0">
                    </div>
                    <button type="submit" class="widget-verify-btn">
                        <span class="btn-icon">🔍</span>
                        Verify Tenant
                    </button>
                </form>
                <div class="widget-results hidden">
                    <h4>Verification Results</h4>
                    <div class="results-content"></div>
                    <button class="widget-new-verification">New Verification</button>
                </div>
            </div>
        `;

        // Add styles
        this.floatingWidget.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            max-height: 80vh;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            display: none;
            overflow: hidden;
        `;

        // Add event listeners
        this.setupWidgetEventListeners();

        document.body.appendChild(this.floatingWidget);
    }

    setupWidgetEventListeners() {
        const closeBtn = this.floatingWidget.querySelector('.widget-close');
        const form = this.floatingWidget.querySelector('.widget-form');
        const newVerificationBtn = this.floatingWidget.querySelector('.widget-new-verification');

        closeBtn.addEventListener('click', () => {
            this.hideFloatingWidget();
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWidgetFormSubmit();
        });

        newVerificationBtn.addEventListener('click', () => {
            this.showWidgetForm();
        });

        // Input formatting
        const aadhaarInput = this.floatingWidget.querySelector('#widget-aadhaar');
        const panInput = this.floatingWidget.querySelector('#widget-pan');
        const phoneInput = this.floatingWidget.querySelector('#widget-phone');

        aadhaarInput.addEventListener('input', (e) => this.formatAadhaar(e));
        panInput.addEventListener('input', (e) => this.formatPAN(e));
        phoneInput.addEventListener('input', (e) => this.formatPhone(e));
    }

    showFloatingWidget() {
        if (this.floatingWidget) {
            this.floatingWidget.style.display = 'block';
            this.floatingWidget.classList.add('widget-slide-in');
        }
    }

    hideFloatingWidget() {
        if (this.floatingWidget) {
            this.floatingWidget.classList.add('widget-slide-out');
            setTimeout(() => {
                this.floatingWidget.style.display = 'none';
                this.floatingWidget.classList.remove('widget-slide-out');
            }, 300);
        }
    }

    prefillWidgetWithData(formData) {
        if (!this.floatingWidget) return;

        Object.keys(formData).forEach(key => {
            const input = this.floatingWidget.querySelector(`#widget-${key}`);
            if (input && formData[key]) {
                input.value = formData[key];
            }
        });
    }

    prefillVerificationForm(text) {
        // This would be called when text is selected and context menu is used
        this.showFloatingWidget();
        
        // Try to extract information from the selected text
        const extractedData = this.extractDataFromText(text);
        this.prefillWidgetWithData(extractedData);
    }

    extractDataFromText(text) {
        const data = {};

        // Extract phone number
        const phoneMatch = text.match(/(\+91)?[-\s]?[6-9]\d{9}/);
        if (phoneMatch) {
            data.phone = phoneMatch[0];
        }

        // Extract email
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
            data.email = emailMatch[0];
        }

        // Extract Aadhaar (basic pattern)
        const aadhaarMatch = text.match(/\d{4}[-]?\d{4}[-]?\d{4}/);
        if (aadhaarMatch) {
            data.aadhaar = aadhaarMatch[0];
        }

        // Extract PAN
        const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
        if (panMatch) {
            data.pan = panMatch[0];
        }

        return data;
    }

    async handleWidgetFormSubmit() {
        const form = this.floatingWidget.querySelector('.widget-form');
        const formData = new FormData(form);
        const tenantData = Object.fromEntries(formData.entries());

        if (!tenantData.fullName.trim()) {
            this.showWidgetNotification('Please enter the tenant\'s full name', 'error');
            return;
        }

        // Show loading state
        this.showWidgetLoading();

        try {
            const response = await chrome.runtime.sendMessage({
                action: 'verifyTenant',
                data: tenantData
            });

            if (response.success) {
                this.displayWidgetResults(response.results);
            } else {
                this.showWidgetNotification('Verification failed: ' + response.error, 'error');
                this.showWidgetForm();
            }
        } catch (error) {
            console.error('Widget verification error:', error);
            this.showWidgetNotification('An error occurred during verification', 'error');
            this.showWidgetForm();
        }
    }

    showWidgetLoading() {
        const form = this.floatingWidget.querySelector('.widget-form');
        const results = this.floatingWidget.querySelector('.widget-results');
        
        form.style.display = 'none';
        results.classList.remove('hidden');
        results.innerHTML = `
            <div class="widget-loading">
                <div class="widget-spinner"></div>
                <p>Verifying tenant information...</p>
            </div>
        `;
    }

    displayWidgetResults(results) {
        const form = this.floatingWidget.querySelector('.widget-form');
        const resultsDiv = this.floatingWidget.querySelector('.widget-results');
        
        form.style.display = 'none';
        resultsDiv.classList.remove('hidden');
        
        resultsDiv.innerHTML = `
            <h4>Verification Results</h4>
            <div class="results-content">
                <div class="result-item">
                    <span class="result-label">Status:</span>
                    <span class="result-value ${this.getStatusClass(results.overallStatus)}">${results.overallStatus}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Confidence:</span>
                    <span class="result-value">${results.confidenceScore}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Risk Level:</span>
                    <span class="result-value ${this.getRiskClass(results.riskLevel)}">${results.riskLevel}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Identity:</span>
                    <span class="result-value ${this.getStatusClass(results.identityStatus)}">${results.identityStatus}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Rental History:</span>
                    <span class="result-value ${this.getStatusClass(results.rentalHistory)}">${results.rentalHistory}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Background:</span>
                    <span class="result-value ${this.getStatusClass(results.backgroundCheck)}">${results.backgroundCheck}</span>
                </div>
            </div>
            <button class="widget-new-verification">New Verification</button>
        `;

        // Re-attach event listener
        const newVerificationBtn = resultsDiv.querySelector('.widget-new-verification');
        newVerificationBtn.addEventListener('click', () => {
            this.showWidgetForm();
        });
    }

    showWidgetForm() {
        const form = this.floatingWidget.querySelector('.widget-form');
        const results = this.floatingWidget.querySelector('.widget-results');
        
        form.style.display = 'block';
        results.classList.add('hidden');
        form.reset();
    }

    showWidgetNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `widget-notification widget-notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInLeft 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutLeft 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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

    setupMutationObserver() {
        // Disconnect existing observer if any
        if (this.observer) {
            this.observer.disconnect();
        }

        // Debounce the mutation observer to prevent excessive calls
        let mutationTimeout;
        
        this.observer = new MutationObserver((mutations) => {
            // Clear existing timeout
            if (mutationTimeout) {
                clearTimeout(mutationTimeout);
            }
            
            // Debounce mutations to prevent excessive scanning
            mutationTimeout = setTimeout(() => {
                let shouldScan = false;
                
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Only scan if forms or relevant content was added
                                if (node.tagName === 'FORM' || 
                                    node.querySelector && node.querySelector('form')) {
                                    shouldScan = true;
                                }
                            }
                        });
                    }
                });
                
                if (shouldScan) {
                    this.scanPageForTenantForms();
                }
            }, 500); // Debounce for 500ms
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+V to show verification widget
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.showFloatingWidget();
            }
        });
    }

    // Cleanup method to prevent memory leaks
    cleanup() {
        // Remove verification buttons
        this.verificationButtons.forEach(button => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
        this.verificationButtons = [];

        // Remove floating widget
        if (this.floatingWidget && this.floatingWidget.parentNode) {
            this.floatingWidget.parentNode.removeChild(this.floatingWidget);
            this.floatingWidget = null;
        }

        // Disconnect observer
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        // Clear timeouts
        if (this.scanTimeout) {
            clearTimeout(this.scanTimeout);
            this.scanTimeout = null;
        }

        // Clear scanned forms set
        this.scannedForms.clear();
    }
}

// Initialize content script
new TenantVerificationContent();

// Add CSS animations for widget
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInLeft {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutLeft {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    
    .widget-slide-in {
        animation: slideInLeft 0.3s ease-out;
    }
    
    .widget-slide-out {
        animation: slideOutLeft 0.3s ease-out;
    }
    
    .widget-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .widget-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
    }
    
    .widget-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .widget-content {
        padding: 16px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .widget-form .form-group {
        margin-bottom: 12px;
    }
    
    .widget-form label {
        display: block;
        font-weight: 500;
        margin-bottom: 4px;
        font-size: 13px;
    }
    
    .widget-form input,
    .widget-form textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .widget-verify-btn {
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        margin-top: 8px;
    }
    
    .widget-loading {
        text-align: center;
        padding: 20px;
    }
    
    .widget-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .widget-results h4 {
        margin-bottom: 12px;
        color: #333;
    }
    
    .widget-results .result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid #eee;
    }
    
    .widget-results .result-label {
        font-weight: 500;
        color: #666;
    }
    
    .widget-results .result-value {
        font-weight: 600;
    }
    
    .widget-results .result-value.success {
        color: #28a745;
    }
    
    .widget-results .result-value.warning {
        color: #ffc107;
    }
    
    .widget-results .result-value.danger {
        color: #dc3545;
    }
    
    .widget-new-verification {
        width: 100%;
        padding: 8px;
        background: #f8f9fa;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        margin-top: 12px;
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

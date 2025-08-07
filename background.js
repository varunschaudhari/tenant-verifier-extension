// Tenant Verification Chrome Extension - Background Service Worker

class TenantVerificationBackground {
    constructor() {
        this.initializeEventListeners();
        this.initializeStorage();
    }

    initializeEventListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Message handling from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Extension icon click
        chrome.action.onClicked.addListener((tab) => {
            this.handleExtensionClick(tab);
        });

        // Context menu - initialize after a delay to ensure API is available
        setTimeout(() => {
            this.initializeContextMenu();
        }, 100);
    }

    async initializeStorage() {
        try {
            const result = await chrome.storage.local.get(['settings', 'verificationHistory']);
            
            // Set default settings if not exists
            if (!result.settings) {
                await chrome.storage.local.set({
                    settings: {
                        autoScan: true,
                        notifications: true,
                        saveHistory: true,
                        apiKeys: {
                            uidai: '',
                            incometax: '',
                            telecom: '',
                            police: ''
                        }
                    }
                });
            }

            // Initialize verification history if not exists
            if (!result.verificationHistory) {
                await chrome.storage.local.set({ verificationHistory: [] });
            }
        } catch (error) {
            console.error('Error initializing storage:', error);
        }
    }

    handleInstallation(details) {
        if (details.reason === 'install') {
            // First time installation
            this.createContextMenu();
            this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension update
            this.showUpdateNotification(details.previousVersion);
        }
    }

    initializeContextMenu() {
        try {
            if (chrome.contextMenus && chrome.contextMenus.onClicked) {
                chrome.contextMenus.onClicked.addListener((info, tab) => {
                    this.handleContextMenuClick(info, tab);
                });
            }
        } catch (error) {
            console.error('Error initializing context menu:', error);
        }
    }

    createContextMenu() {
        try {
            if (chrome.contextMenus) {
                chrome.contextMenus.create({
                    id: 'verifyTenant',
                    title: 'Verify Tenant Information',
                    contexts: ['selection']
                });
            }
        } catch (error) {
            console.error('Error creating context menu:', error);
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'verifyTenant':
                    const results = await this.performVerification(message.data);
                    sendResponse({ success: true, results });
                    break;

                case 'scanPage':
                    const scanResults = await this.scanPageForTenantForms(sender.tab.id);
                    sendResponse(scanResults);
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, settings });
                    break;

                case 'updateSettings':
                    await this.updateSettings(message.settings);
                    sendResponse({ success: true });
                    break;

                case 'getHistory':
                    const history = await this.getVerificationHistory();
                    sendResponse({ success: true, history });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async performVerification(tenantData) {
        // Simulate API verification process
        const results = {
            overallStatus: 'Pending',
            confidenceScore: 0,
            riskLevel: 'Unknown',
            identityStatus: 'Pending',
            rentalHistory: 'Pending',
            backgroundCheck: 'Pending',
            recommendation: '',
            timestamp: new Date().toISOString()
        };

        try {
            // Perform parallel verification checks
            const [identityResult, rentalResult, backgroundResult] = await Promise.all([
                this.verifyIdentity(tenantData),
                this.verifyRentalHistory(tenantData),
                this.performBackgroundCheck(tenantData)
            ]);

            // Update results
            results.identityStatus = identityResult.status;
            results.rentalHistory = rentalResult.status;
            results.backgroundCheck = backgroundResult.status;

            // Calculate overall confidence score
            results.confidenceScore = this.calculateConfidenceScore(identityResult, rentalResult, backgroundResult);

            // Determine risk level
            results.riskLevel = this.calculateRiskLevel(results.confidenceScore, identityResult, rentalResult, backgroundResult);

            // Set overall status
            results.overallStatus = this.determineOverallStatus(results);

            // Generate recommendation
            results.recommendation = this.generateRecommendation(results);

        } catch (error) {
            console.error('Verification error:', error);
            results.overallStatus = 'Failed';
            results.recommendation = 'Verification failed due to technical issues. Please try again.';
        }

        return results;
    }

    async verifyIdentity(tenantData) {
        // Simulate identity verification
        await this.delay(1000 + Math.random() * 2000);

        const aadhaarValid = tenantData.aadhaar && this.validateAadhaar(tenantData.aadhaar);
        const panValid = tenantData.pan && this.validatePAN(tenantData.pan);
        const phoneValid = tenantData.phone && this.validatePhone(tenantData.phone);

        let status = 'Failed';
        let confidence = 0;

        if (aadhaarValid && panValid && phoneValid) {
            status = 'Verified';
            confidence = 95;
        } else if ((aadhaarValid && panValid) || (aadhaarValid && phoneValid) || (panValid && phoneValid)) {
            status = 'Partial';
            confidence = 70;
        } else if (aadhaarValid || panValid || phoneValid) {
            status = 'Pending';
            confidence = 40;
        }

        return { status, confidence, details: { aadhaarValid, panValid, phoneValid } };
    }

    async verifyRentalHistory(tenantData) {
        // Simulate rental history check
        await this.delay(800 + Math.random() * 1500);

        const hasHistory = Math.random() > 0.3; // 70% chance of having rental history
        let status = 'No History';
        let confidence = 0;

        if (hasHistory) {
            const isClean = Math.random() > 0.2; // 80% chance of clean history
            status = isClean ? 'Clean' : 'Issues Found';
            confidence = isClean ? 90 : 30;
        } else {
            confidence = 50; // Neutral score for no history
        }

        return { status, confidence, details: { hasHistory } };
    }

    async performBackgroundCheck(tenantData) {
        // Simulate background check
        await this.delay(1200 + Math.random() * 2500);

        const hasCriminalRecord = Math.random() > 0.95; // 5% chance of criminal record
        const hasFinancialIssues = Math.random() > 0.85; // 15% chance of financial issues

        let status = 'Passed';
        let confidence = 90;

        if (hasCriminalRecord) {
            status = 'Failed';
            confidence = 10;
        } else if (hasFinancialIssues) {
            status = 'Under Review';
            confidence = 60;
        }

        return { status, confidence, details: { hasCriminalRecord, hasFinancialIssues } };
    }

    validateAadhaar(aadhaar) {
        const cleanAadhaar = aadhaar.replace(/-/g, '');
        return /^\d{12}$/.test(cleanAadhaar);
    }

    validatePAN(pan) {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    }

    validatePhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return /^[6-9]\d{9}$/.test(cleanPhone);
    }

    calculateConfidenceScore(identityResult, rentalResult, backgroundResult) {
        const weights = { identity: 0.4, rental: 0.3, background: 0.3 };
        
        const weightedScore = 
            (identityResult.confidence * weights.identity) +
            (rentalResult.confidence * weights.rental) +
            (backgroundResult.confidence * weights.background);

        return Math.round(weightedScore);
    }

    calculateRiskLevel(confidenceScore, identityResult, rentalResult, backgroundResult) {
        if (confidenceScore >= 85 && identityResult.status === 'Verified' && backgroundResult.status === 'Passed') {
            return 'Low';
        } else if (confidenceScore >= 60 && backgroundResult.status !== 'Failed') {
            return 'Medium';
        } else if (confidenceScore >= 30) {
            return 'High';
        } else {
            return 'Very High';
        }
    }

    determineOverallStatus(results) {
        if (results.riskLevel === 'Low' && results.confidenceScore >= 80) {
            return 'Verified';
        } else if (results.riskLevel === 'Medium' || results.confidenceScore >= 60) {
            return 'Pending';
        } else {
            return 'Failed';
        }
    }

    generateRecommendation(results) {
        if (results.overallStatus === 'Verified') {
            return 'This tenant appears to be a good candidate. Proceed with rental agreement.';
        } else if (results.overallStatus === 'Pending') {
            return 'Additional verification recommended. Consider requesting more documents or references.';
        } else {
            return 'Not recommended for rental. Consider alternative candidates or additional screening.';
        }
    }

    async scanPageForTenantForms(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'scanPage' });
            return response || { found: false, count: 0 };
        } catch (error) {
            console.error('Error scanning page:', error);
            return { found: false, count: 0, error: error.message };
        }
    }

    async getSettings() {
        try {
            const result = await chrome.storage.local.get(['settings']);
            return result.settings || {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    }

    async updateSettings(newSettings) {
        try {
            await chrome.storage.local.set({ settings: newSettings });
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    async getVerificationHistory() {
        try {
            const result = await chrome.storage.local.get(['verificationHistory']);
            return result.verificationHistory || [];
        } catch (error) {
            console.error('Error getting history:', error);
            return [];
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        if (changeInfo.status === 'complete' && tab.url) {
            // Check if this is a rental website
            if (this.isRentalWebsite(tab.url)) {
                this.injectContentScript(tabId);
            }
        }
    }

    isRentalWebsite(url) {
        const rentalKeywords = [
            'magicbricks', '99acres', 'housing', 'propexpert', 'squareyards',
            'nestaway', 'zolo', 'rent', 'lease', 'property', 'real estate'
        ];

        const urlLower = url.toLowerCase();
        return rentalKeywords.some(keyword => urlLower.includes(keyword));
    }

    async injectContentScript(tabId) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            });
        } catch (error) {
            console.error('Error injecting content script:', error);
        }
    }

    handleExtensionClick(tab) {
        // Open popup (handled by manifest)
        console.log('Extension clicked on tab:', tab.id);
    }

    handleContextMenuClick(info, tab) {
        if (info.menuItemId === 'verifyTenant') {
            const selectedText = info.selectionText;
            this.sendTextToPopup(selectedText, tab.id);
        }
    }

    async sendTextToPopup(text, tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, {
                action: 'prefillVerification',
                text: text
            });
        } catch (error) {
            console.error('Error sending text to popup:', error);
        }
    }

    showWelcomeNotification() {
        try {
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Tenant Verification India',
                    message: 'Welcome! Your tenant verification extension is now ready to use.'
                });
            }
        } catch (error) {
            console.error('Error showing welcome notification:', error);
        }
    }

    showUpdateNotification(previousVersion) {
        try {
            if (chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Tenant Verification Updated',
                    message: `Extension updated from ${previousVersion} to 1.0.0. Check out the new features!`
                });
            }
        } catch (error) {
            console.error('Error showing update notification:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the background service worker
new TenantVerificationBackground();

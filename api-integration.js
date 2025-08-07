// API Integration for Tenant Verification India
// This file handles real API connections to Indian verification services

class VerificationAPI {
    constructor() {
        // Load environment configuration
        this.envConfig = this.loadEnvironmentConfig();
        
        this.baseURLs = {
            uidai: this.envConfig.get('UIDAI_BASE_URL') || 'https://resident.uidai.gov.in/',
            incometax: this.envConfig.get('INCOMETAX_BASE_URL') || 'https://www.incometax.gov.in/',
            telecom: this.envConfig.get('TELECOM_BASE_URL') || 'https://www.trai.gov.in/',
            police: this.envConfig.get('POLICE_BASE_URL') || 'https://bprd.gov.in/',
            rental: this.envConfig.get('RENTAL_BASE_URL') || 'https://api.rentalverification.in/'
        };
        
        this.apiKeys = {
            uidai: this.envConfig.get('UIDAI_API_KEY') || process.env.UIDAI_API_KEY || '',
            incometax: this.envConfig.get('INCOMETAX_API_KEY') || process.env.INCOMETAX_API_KEY || '',
            telecom: this.envConfig.get('TELECOM_API_KEY') || process.env.TELECOM_API_KEY || '',
            police: this.envConfig.get('POLICE_API_KEY') || process.env.POLICE_API_KEY || '',
            rental: this.envConfig.get('RENTAL_API_KEY') || process.env.RENTAL_API_KEY || '',
            email: this.envConfig.get('EMAIL_API_KEY') || process.env.EMAIL_API_KEY || ''
        };
        
        this.rateLimits = {
            uidai: { requests: 0, limit: this.envConfig.get('UIDAI_RATE_LIMIT') || 100, resetTime: Date.now() + 3600000 },
            incometax: { requests: 0, limit: this.envConfig.get('INCOMETAX_RATE_LIMIT') || 50, resetTime: Date.now() + 3600000 },
            telecom: { requests: 0, limit: this.envConfig.get('TELECOM_RATE_LIMIT') || 200, resetTime: Date.now() + 3600000 },
            police: { requests: 0, limit: this.envConfig.get('POLICE_RATE_LIMIT') || 30, resetTime: Date.now() + 3600000 },
            rental: { requests: 0, limit: this.envConfig.get('RENTAL_RATE_LIMIT') || 500, resetTime: Date.now() + 3600000 }
        };
        
            // Log configuration status
    if (this.envConfig.isDebug()) {
        console.log('VerificationAPI initialized with environment config');
        console.log('Environment:', this.envConfig.isProduction() ? 'Production' : 'Development');
        this.logConfigurationStatus();
    }
    }
    
    // Load environment configuration
    loadEnvironmentConfig() {
        // Try to load from env.js file first
        if (typeof ENV_CONFIG !== 'undefined') {
            return ENV_CONFIG;
        }
        
        // Fallback to process.env
        return {
            get: function(key) {
                return process.env[key] || '';
            },
            isProduction: function() {
                return process.env.NODE_ENV === 'production';
            },
            isDebug: function() {
                return process.env.DEBUG === 'true';
            }
        };
    }

    // Log configuration status for debugging
    logConfigurationStatus() {
        const configuredServices = [];
        const notConfiguredServices = [];

        if (this.apiKeys.uidai && this.apiKeys.uidai !== 'your_uidai_production_api_key_here') {
            configuredServices.push('UIDAI');
        } else {
            notConfiguredServices.push('UIDAI');
        }

        if (this.apiKeys.incometax && this.apiKeys.incometax !== 'your_incometax_production_api_key_here') {
            configuredServices.push('Income Tax');
        } else {
            notConfiguredServices.push('Income Tax');
        }

        if (this.apiKeys.telecom && this.apiKeys.telecom !== 'your_telecom_production_api_key_here') {
            configuredServices.push('Telecom');
        } else {
            notConfiguredServices.push('Telecom');
        }

        if (this.apiKeys.police && this.apiKeys.police !== 'your_police_production_api_key_here') {
            configuredServices.push('Police');
        } else {
            notConfiguredServices.push('Police');
        }

        if (this.apiKeys.rental && this.apiKeys.rental !== 'your_rental_database_production_api_key_here') {
            configuredServices.push('Rental Database');
        } else {
            notConfiguredServices.push('Rental Database');
        }

        if (this.apiKeys.email && this.apiKeys.email !== 'your_email_verification_production_api_key_here') {
            configuredServices.push('Email Verification');
        } else {
            notConfiguredServices.push('Email Verification');
        }

        console.log('🔧 Configuration Status:');
        console.log('✅ Configured services:', configuredServices.length > 0 ? configuredServices.join(', ') : 'None');
        console.log('❌ Not configured services:', notConfiguredServices.length > 0 ? notConfiguredServices.join(', ') : 'None');
        
        if (notConfiguredServices.length > 0) {
            console.log('💡 To configure services, run: npm run setup-env');
        }
    }

    // Rate limiting check
    checkRateLimit(service) {
        const limit = this.rateLimits[service];
        if (Date.now() > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = Date.now() + 3600000; // Reset after 1 hour
        }
        
        if (limit.requests >= limit.limit) {
            throw new Error(`Rate limit exceeded for ${service}. Try again later.`);
        }
        
        limit.requests++;
        return true;
    }

    // Aadhaar Verification API
    async verifyAadhaar(aadhaarNumber, otp = null) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.uidai || this.apiKeys.uidai === 'your_uidai_production_api_key_here') {
                return {
                    verified: false,
                    error: 'UIDAI API key not configured. Please set up your environment variables.',
                    source: 'UIDAI',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            this.checkRateLimit('uidai');
            
            // Remove any formatting from Aadhaar number
            const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
            
            if (cleanAadhaar.length !== 12) {
                throw new Error('Invalid Aadhaar number. Must be 12 digits.');
            }

            // UIDAI API endpoint (this is a mock - replace with actual API)
            const response = await fetch(`${this.baseURLs.uidai}api/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.uidai}`,
                    'X-API-Version': '2.0'
                },
                body: JSON.stringify({
                    aadhaar_number: cleanAadhaar,
                    otp: otp,
                    consent: true,
                    purpose: 'tenant_verification'
                })
            });

            if (!response.ok) {
                throw new Error(`UIDAI API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                verified: data.status === 'success',
                name: data.name || null,
                dob: data.date_of_birth || null,
                address: data.address || null,
                gender: data.gender || null,
                photo: data.photo_url || null,
                lastVerified: new Date().toISOString(),
                source: 'UIDAI',
                confidence: data.verified ? 95 : 0,
                status: 'success'
            };
        } catch (error) {
            console.error('Aadhaar verification error:', error);
            return {
                verified: false,
                error: error.message,
                source: 'UIDAI',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // PAN Verification API
    async verifyPAN(panNumber) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.incometax || this.apiKeys.incometax === 'your_incometax_production_api_key_here') {
                return {
                    verified: false,
                    error: 'Income Tax API key not configured. Please set up your environment variables.',
                    source: 'Income Tax Department',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            this.checkRateLimit('incometax');
            
            const cleanPAN = panNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            if (cleanPAN.length !== 10) {
                throw new Error('Invalid PAN number. Must be 10 characters.');
            }

            // Income Tax API endpoint
            const response = await fetch(`${this.baseURLs.incometax}api/pan/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.incometax}`,
                    'X-API-Version': '1.0'
                },
                body: JSON.stringify({
                    pan_number: cleanPAN,
                    purpose: 'tenant_verification'
                })
            });

            if (!response.ok) {
                throw new Error(`Income Tax API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                verified: data.status === 'active',
                name: data.name || null,
                status: data.status || 'unknown',
                category: data.category || null,
                lastVerified: new Date().toISOString(),
                source: 'Income Tax Department',
                confidence: data.verified ? 90 : 0,
                verificationStatus: 'success'
            };
        } catch (error) {
            console.error('PAN verification error:', error);
            return {
                verified: false,
                error: error.message,
                source: 'Income Tax Department',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // Phone Number Verification
    async verifyPhone(phoneNumber) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.telecom || this.apiKeys.telecom === 'your_telecom_production_api_key_here') {
                return {
                    verified: false,
                    error: 'Telecom API key not configured. Please set up your environment variables.',
                    source: 'Telecom Database',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            this.checkRateLimit('telecom');
            
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            
            if (cleanPhone.length !== 10) {
                throw new Error('Invalid phone number. Must be 10 digits.');
            }

            // Telecom API endpoint
            const response = await fetch(`${this.baseURLs.telecom}api/phone/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.telecom}`
                },
                body: JSON.stringify({
                    phone_number: cleanPhone,
                    purpose: 'tenant_verification'
                })
            });

            if (!response.ok) {
                throw new Error(`Telecom API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                verified: data.status === 'active',
                carrier: data.carrier || null,
                location: data.location || null,
                type: data.type || null, // prepaid/postpaid
                lastVerified: new Date().toISOString(),
                source: 'Telecom Database',
                confidence: data.verified ? 85 : 0,
                status: 'success'
            };
        } catch (error) {
            console.error('Phone verification error:', error);
            return {
                verified: false,
                error: error.message,
                source: 'Telecom Database',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // Email Verification
    async verifyEmail(email) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.email || this.apiKeys.email === 'your_email_verification_production_api_key_here') {
                return {
                    verified: false,
                    error: 'Email verification API key not configured. Please set up your environment variables.',
                    source: 'Email Verification Service',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format.');
            }

            // Email verification service
            const response = await fetch('https://api.email-validator.net/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    api_key: this.apiKeys.email
                })
            });

            if (!response.ok) {
                throw new Error(`Email verification error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                verified: data.status === 'valid',
                domain: email.split('@')[1],
                disposable: data.disposable || false,
                lastVerified: new Date().toISOString(),
                source: 'Email Verification Service',
                confidence: data.verified ? 70 : 0,
                status: 'success'
            };
        } catch (error) {
            console.error('Email verification error:', error);
            return {
                verified: false,
                error: error.message,
                source: 'Email Verification Service',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // Background Check API
    async performBackgroundCheck(tenantData) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.police || this.apiKeys.police === 'your_police_production_api_key_here') {
                return {
                    criminalRecord: false,
                    courtCases: 0,
                    error: 'Police/Background check API key not configured. Please set up your environment variables.',
                    source: 'Background Check Service',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            this.checkRateLimit('police');
            
            // Police/Background check API
            const response = await fetch(`${this.baseURLs.police}api/background-check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.police}`
                },
                body: JSON.stringify({
                    name: tenantData.fullName,
                    aadhaar: tenantData.aadhaarNumber,
                    pan: tenantData.panNumber,
                    phone: tenantData.phoneNumber,
                    purpose: 'tenant_verification'
                })
            });

            if (!response.ok) {
                throw new Error(`Background check API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                criminalRecord: data.criminal_record || false,
                courtCases: data.court_cases || 0,
                pendingCases: data.pending_cases || 0,
                creditScore: data.credit_score || null,
                employmentStatus: data.employment_status || null,
                lastVerified: new Date().toISOString(),
                source: 'Background Check Service',
                confidence: data.verified ? 80 : 0,
                status: 'success'
            };
        } catch (error) {
            console.error('Background check error:', error);
            return {
                criminalRecord: false,
                courtCases: 0,
                error: error.message,
                source: 'Background Check Service',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // Rental History Check
    async checkRentalHistory(tenantData) {
        try {
            // Check if API key is configured
            if (!this.apiKeys.rental || this.apiKeys.rental === 'your_rental_database_production_api_key_here') {
                return {
                    totalRentals: 0,
                    issues: [],
                    error: 'Rental database API key not configured. Please set up your environment variables.',
                    source: 'Rental History Database',
                    lastVerified: new Date().toISOString(),
                    status: 'not_configured'
                };
            }

            this.checkRateLimit('rental');
            
            // Rental history database API
            const response = await fetch(`${this.baseURLs.rental}api/rental-history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKeys.rental}`
                },
                body: JSON.stringify({
                    name: tenantData.fullName,
                    phone: tenantData.phoneNumber,
                    aadhaar: tenantData.aadhaarNumber,
                    purpose: 'tenant_verification'
                })
            });

            if (!response.ok) {
                throw new Error(`Rental history API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                totalRentals: data.total_rentals || 0,
                currentRentals: data.current_rentals || 0,
                pastRentals: data.past_rentals || 0,
                issues: data.issues || [],
                evictions: data.evictions || 0,
                latePayments: data.late_payments || 0,
                averageRating: data.average_rating || null,
                lastRental: data.last_rental || null,
                lastVerified: new Date().toISOString(),
                source: 'Rental History Database',
                confidence: data.verified ? 75 : 0,
                status: 'success'
            };
        } catch (error) {
            console.error('Rental history check error:', error);
            return {
                totalRentals: 0,
                issues: [],
                error: error.message,
                source: 'Rental History Database',
                lastVerified: new Date().toISOString(),
                status: 'error'
            };
        }
    }

    // Comprehensive verification
    async performComprehensiveVerification(tenantData) {
        const results = {
            timestamp: new Date().toISOString(),
            tenantData: tenantData,
            verifications: {},
            overallScore: 0,
            riskLevel: 'Unknown',
            recommendations: []
        };

        try {
            // Parallel verification calls
            const verificationPromises = [];

            if (tenantData.aadhaarNumber) {
                verificationPromises.push(
                    this.verifyAadhaar(tenantData.aadhaarNumber)
                        .then(result => { results.verifications.aadhaar = result; })
                );
            }

            if (tenantData.panNumber) {
                verificationPromises.push(
                    this.verifyPAN(tenantData.panNumber)
                        .then(result => { results.verifications.pan = result; })
                );
            }

            if (tenantData.phoneNumber) {
                verificationPromises.push(
                    this.verifyPhone(tenantData.phoneNumber)
                        .then(result => { results.verifications.phone = result; })
                );
            }

            if (tenantData.email) {
                verificationPromises.push(
                    this.verifyEmail(tenantData.email)
                        .then(result => { results.verifications.email = result; })
                );
            }

            // Background and rental checks
            verificationPromises.push(
                this.performBackgroundCheck(tenantData)
                    .then(result => { results.verifications.background = result; })
            );

            verificationPromises.push(
                this.checkRentalHistory(tenantData)
                    .then(result => { results.verifications.rental = result; })
            );

            // Wait for all verifications to complete
            await Promise.all(verificationPromises);

            // Calculate overall score and risk level
            results.overallScore = this.calculateOverallScore(results.verifications);
            results.riskLevel = this.calculateRiskLevel(results.overallScore);
            results.recommendations = this.generateRecommendations(results);

            return results;

        } catch (error) {
            console.error('Comprehensive verification error:', error);
            results.error = error.message;
            return results;
        }
    }

    // Calculate overall verification score
    calculateOverallScore(verifications) {
        let totalScore = 0;
        let totalWeight = 0;
        let configuredServices = 0;

        // Aadhaar verification (weight: 30%)
        if (verifications.aadhaar) {
            if (verifications.aadhaar.status === 'not_configured') {
                // Skip not configured services
            } else if (verifications.aadhaar.verified) {
                totalScore += 30;
                totalWeight += 30;
                configuredServices++;
            }
        }

        // PAN verification (weight: 25%)
        if (verifications.pan) {
            if (verifications.pan.status === 'not_configured') {
                // Skip not configured services
            } else if (verifications.pan.verified) {
                totalScore += 25;
                totalWeight += 25;
                configuredServices++;
            }
        }

        // Phone verification (weight: 20%)
        if (verifications.phone) {
            if (verifications.phone.status === 'not_configured') {
                // Skip not configured services
            } else if (verifications.phone.verified) {
                totalScore += 20;
                totalWeight += 20;
                configuredServices++;
            }
        }

        // Email verification (weight: 10%)
        if (verifications.email) {
            if (verifications.email.status === 'not_configured') {
                // Skip not configured services
            } else if (verifications.email.verified) {
                totalScore += 10;
                totalWeight += 10;
                configuredServices++;
            }
        }

        // Background check (weight: 15%)
        if (verifications.background) {
            if (verifications.background.status === 'not_configured') {
                // Skip not configured services
            } else if (!verifications.background.criminalRecord) {
                totalScore += 15;
                totalWeight += 15;
                configuredServices++;
            }
        }

        // If no services are configured, return 0
        if (configuredServices === 0) {
            return 0;
        }

        return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    }

    // Calculate risk level based on score
    calculateRiskLevel(score) {
        if (score >= 90) return 'Low';
        if (score >= 70) return 'Medium';
        if (score >= 50) return 'High';
        return 'Very High';
    }

    // Generate recommendations
    generateRecommendations(results) {
        const recommendations = [];

        // Check if any services are not configured
        const notConfiguredServices = [];
        if (results.verifications.aadhaar && results.verifications.aadhaar.status === 'not_configured') {
            notConfiguredServices.push('Aadhaar verification');
        }
        if (results.verifications.pan && results.verifications.pan.status === 'not_configured') {
            notConfiguredServices.push('PAN verification');
        }
        if (results.verifications.phone && results.verifications.phone.status === 'not_configured') {
            notConfiguredServices.push('Phone verification');
        }
        if (results.verifications.email && results.verifications.email.status === 'not_configured') {
            notConfiguredServices.push('Email verification');
        }
        if (results.verifications.background && results.verifications.background.status === 'not_configured') {
            notConfiguredServices.push('Background check');
        }
        if (results.verifications.rental && results.verifications.rental.status === 'not_configured') {
            notConfiguredServices.push('Rental history');
        }

        // If all services are not configured, show setup message
        if (notConfiguredServices.length === 6) {
            recommendations.push('SETUP REQUIRED: No API keys configured. Please set up your environment variables to enable verification services.');
            recommendations.push('See ENVIRONMENT_SETUP.md for detailed instructions.');
            return recommendations;
        }

        // If some services are not configured, show partial setup message
        if (notConfiguredServices.length > 0) {
            recommendations.push(`PARTIAL SETUP: The following services are not configured: ${notConfiguredServices.join(', ')}`);
            recommendations.push('Configure these services for complete verification coverage.');
        }

        // Only show verification recommendations if we have configured services
        if (results.overallScore > 0) {
            if (results.overallScore >= 90) {
                recommendations.push('RECOMMENDED: This tenant appears to be a good candidate for rental.');
            } else if (results.overallScore >= 70) {
                recommendations.push('CAUTION: Additional verification may be required before proceeding.');
            } else {
                recommendations.push('NOT RECOMMENDED: This tenant has significant risk factors.');
            }

            // Specific recommendations based on verification results
            if (results.verifications.background && results.verifications.background.status !== 'not_configured' && results.verifications.background.criminalRecord) {
                recommendations.push('CRITICAL: Criminal record found. Strongly advise against proceeding.');
            }

            if (results.verifications.rental && results.verifications.rental.status !== 'not_configured' && results.verifications.rental.evictions > 0) {
                recommendations.push('WARNING: Previous evictions detected. Proceed with extreme caution.');
            }

            if (results.verifications.rental && results.verifications.rental.status !== 'not_configured' && results.verifications.rental.latePayments > 3) {
                recommendations.push('CAUTION: Multiple late payments in rental history.');
            }
        } else if (notConfiguredServices.length === 0) {
            recommendations.push('NO VERIFICATION DATA: Unable to verify tenant information with current configuration.');
        }

        return recommendations;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VerificationAPI;
} else {
    window.VerificationAPI = VerificationAPI;
}

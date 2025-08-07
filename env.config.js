// Environment Configuration for Tenant Verification India
// This file contains production environment variables and configuration
// Copy this file and rename it to env.js for actual use

const ENV_CONFIG = {
    // API Keys for Indian Government Services
    UIDAI_API_KEY: 'your_uidai_production_api_key_here',
    INCOMETAX_API_KEY: 'your_incometax_production_api_key_here',
    TELECOM_API_KEY: 'your_telecom_production_api_key_here',
    POLICE_API_KEY: 'your_police_production_api_key_here',
    RENTAL_API_KEY: 'your_rental_database_production_api_key_here',
    EMAIL_API_KEY: 'your_email_verification_production_api_key_here',

    // API Base URLs (Production)
    UIDAI_BASE_URL: 'https://resident.uidai.gov.in/',
    INCOMETAX_BASE_URL: 'https://www.incometax.gov.in/',
    TELECOM_BASE_URL: 'https://www.trai.gov.in/',
    POLICE_BASE_URL: 'https://bprd.gov.in/',
    RENTAL_BASE_URL: 'https://api.rentalverification.in/',

    // Rate Limiting Configuration (Production)
    UIDAI_RATE_LIMIT: 100,
    INCOMETAX_RATE_LIMIT: 50,
    TELECOM_RATE_LIMIT: 200,
    POLICE_RATE_LIMIT: 30,
    RENTAL_RATE_LIMIT: 500,

    // Application Configuration
    NODE_ENV: 'production',
    DEBUG: false,
    LOG_LEVEL: 'error',

    // Security Configuration
    ENCRYPTION_KEY: 'your_production_encryption_key_here',
    JWT_SECRET: 'your_production_jwt_secret_here',

    // Database Configuration (if applicable)
    DB_HOST: 'your_production_db_host',
    DB_PORT: 5432,
    DB_NAME: 'tenant_verification_prod',
    DB_USER: 'your_production_db_user',
    DB_PASSWORD: 'your_production_db_password',

    // External Service Configuration
    SENTRY_DSN: 'your_sentry_dsn_for_error_tracking',
    GOOGLE_ANALYTICS_ID: 'your_google_analytics_id',

    // Feature Flags
    ENABLE_BACKGROUND_CHECK: true,
    ENABLE_RENTAL_HISTORY: true,
    ENABLE_EMAIL_VERIFICATION: true,
    ENABLE_REAL_TIME_VERIFICATION: true,

    // Notification Configuration
    SMTP_HOST: 'your_smtp_host',
    SMTP_PORT: 587,
    SMTP_USER: 'your_smtp_user',
    SMTP_PASSWORD: 'your_smtp_password',
    NOTIFICATION_EMAIL: 'support@tenantverification.in',

    // Chrome Extension Specific
    EXTENSION_ID: 'tenant-verification-india',
    STORE_URL: 'https://chrome.google.com/webstore/detail/tenant-verification-india',

    // Helper function to get environment variable
    get: function(key) {
        return this[key] || process.env[key] || '';
    },

    // Helper function to check if running in production
    isProduction: function() {
        return this.NODE_ENV === 'production';
    },

    // Helper function to check if debug mode is enabled
    isDebug: function() {
        return this.DEBUG === true;
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV_CONFIG;
} else {
    window.ENV_CONFIG = ENV_CONFIG;
}

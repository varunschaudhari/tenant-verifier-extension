# Environment Setup Guide

This guide explains how to configure environment variables for the Tenant Verification India Chrome extension in production.

## Overview

The extension uses various API keys and configuration values to connect to Indian government verification services. These should be stored securely and not committed to version control.

## Files Created

1. **`.gitignore`** - Excludes sensitive files from version control
2. **`env.config.js`** - Template configuration file with all required environment variables
3. **`ENVIRONMENT_SETUP.md`** - This setup guide

## Setup Instructions

### 1. Create Production Environment File

Copy the `env.config.js` file and rename it to `env.js`:

```bash
cp env.config.js env.js
```

### 2. Update Production Values

Edit `env.js` and replace the placeholder values with your actual production API keys:

```javascript
const ENV_CONFIG = {
    // Replace these with your actual API keys
    UIDAI_API_KEY: 'your_actual_uidai_api_key',
    INCOMETAX_API_KEY: 'your_actual_incometax_api_key',
    TELECOM_API_KEY: 'your_actual_telecom_api_key',
    POLICE_API_KEY: 'your_actual_police_api_key',
    RENTAL_API_KEY: 'your_actual_rental_api_key',
    EMAIL_API_KEY: 'your_actual_email_api_key',
    
    // Update other configuration as needed
    NODE_ENV: 'production',
    DEBUG: false,
    // ... other settings
};
```

### 3. Required API Keys

You'll need to obtain API keys from the following services:

#### UIDAI (Aadhaar Verification)
- **Service**: Unique Identification Authority of India
- **Purpose**: Aadhaar number verification
- **URL**: https://resident.uidai.gov.in/
- **Contact**: Apply through official UIDAI portal

#### Income Tax Department (PAN Verification)
- **Service**: Income Tax Department of India
- **Purpose**: PAN card verification
- **URL**: https://www.incometax.gov.in/
- **Contact**: Apply through official Income Tax portal

#### Telecom Regulatory Authority (Phone Verification)
- **Service**: TRAI (Telecom Regulatory Authority of India)
- **Purpose**: Phone number verification
- **URL**: https://www.trai.gov.in/
- **Contact**: Apply through official TRAI portal

#### Police Department (Background Check)
- **Service**: Bureau of Police Research and Development
- **Purpose**: Criminal background verification
- **URL**: https://bprd.gov.in/
- **Contact**: Apply through official BPRD portal

#### Rental Database (Rental History)
- **Service**: Rental verification database
- **Purpose**: Rental history and tenant screening
- **URL**: https://api.rentalverification.in/
- **Contact**: Contact rental verification service providers

#### Email Verification Service
- **Service**: Email validation service
- **Purpose**: Email address verification
- **Contact**: Various providers available (e.g., email-validator.net)

### 4. Integration with Code

The `api-integration.js` file is already configured to use these environment variables. It accesses them through:

```javascript
this.apiKeys = {
    uidai: process.env.UIDAI_API_KEY || '',
    incometax: process.env.INCOMETAX_API_KEY || '',
    telecom: process.env.TELECOM_API_KEY || '',
    police: process.env.POLICE_API_KEY || '',
    rental: process.env.RENTAL_API_KEY || ''
};
```

### 5. Security Best Practices

1. **Never commit API keys to version control**
   - The `.gitignore` file excludes `env.js` from commits
   - Always use placeholder values in templates

2. **Use strong, unique API keys**
   - Generate strong keys for each service
   - Rotate keys regularly

3. **Limit API key permissions**
   - Only grant necessary permissions to API keys
   - Use read-only keys where possible

4. **Monitor API usage**
   - Set up alerts for unusual API usage
   - Monitor rate limits and quotas

5. **Secure storage**
   - Store API keys securely
   - Use environment-specific configurations

### 6. Environment-Specific Configuration

You can create different configuration files for different environments:

- `env.development.js` - Development environment
- `env.staging.js` - Staging environment  
- `env.production.js` - Production environment

### 7. Testing Configuration

To test your configuration:

1. Load the extension in Chrome
2. Open the developer console
3. Check for any API key related errors
4. Test verification functionality

**Note**: If API keys are not configured, the extension will show appropriate error messages instead of attempting to make API calls. This prevents unnecessary errors and provides clear feedback to users about what needs to be configured.

### 8. Troubleshooting

#### Common Issues

1. **API Key Not Found**
   - Ensure `env.js` file exists and is properly configured
   - Check that API keys are correctly formatted
   - Run `npm run setup-env` to create the environment file

2. **"API key not configured" Messages**
   - This is expected behavior when API keys are not set up
   - Follow the setup instructions above to configure your API keys
   - The extension will show helpful messages instead of making failed API calls

3. **Rate Limiting Errors**
   - Adjust rate limits in configuration
   - Implement proper error handling

4. **CORS Issues**
   - Ensure API endpoints allow Chrome extension requests
   - Add necessary permissions to `manifest.json`

#### Debug Mode

Enable debug mode for troubleshooting:

```javascript
DEBUG: true,
LOG_LEVEL: 'debug'
```

### 9. Deployment Checklist

Before deploying to production:

- [ ] All API keys are configured
- [ ] Rate limits are set appropriately
- [ ] Error handling is implemented
- [ ] Security measures are in place
- [ ] Configuration is tested
- [ ] Documentation is updated

## Support

For issues with environment setup:

1. Check the troubleshooting section above
2. Review API provider documentation
3. Contact support@tenantverification.in

## Legal Compliance

Ensure compliance with Indian data protection laws:

- **Aadhaar Act, 2016** - For Aadhaar verification
- **IT Act, 2000** - For data protection
- **GDPR** - If applicable to your use case

Always obtain proper consent and follow data protection guidelines when handling personal information.

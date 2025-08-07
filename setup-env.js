#!/usr/bin/env node

/**
 * Environment Setup Script for Tenant Verification India
 * This script helps users set up their production environment configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Tenant Verification India - Environment Setup');
console.log('================================================\n');

// Check if env.js already exists
const envPath = path.join(__dirname, 'env.js');
if (fs.existsSync(envPath)) {
    console.log('⚠️  env.js already exists!');
    console.log('   If you want to recreate it, please delete the existing file first.\n');
    process.exit(0);
}

// Check if env.config.js exists
const configPath = path.join(__dirname, 'env.config.js');
if (!fs.existsSync(configPath)) {
    console.log('❌ env.config.js not found!');
    console.log('   Please ensure env.config.js exists in the project root.\n');
    process.exit(1);
}

try {
    // Copy env.config.js to env.js
    fs.copyFileSync(configPath, envPath);
    
    console.log('✅ Successfully created env.js from template!');
    console.log('\n📝 Next steps:');
    console.log('   1. Edit env.js and replace placeholder values with your actual API keys');
    console.log('   2. Ensure env.js is listed in .gitignore (it should be already)');
    console.log('   3. Test your configuration by loading the extension in Chrome');
    console.log('\n📚 For detailed instructions, see ENVIRONMENT_SETUP.md');
    console.log('\n🔒 Security reminder: Never commit env.js to version control!');
    
} catch (error) {
    console.log('❌ Error creating env.js:', error.message);
    process.exit(1);
}

console.log('\n🎉 Setup complete!');

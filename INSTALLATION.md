# Installation Guide - Tenant Verification India Chrome Extension

This guide provides step-by-step instructions for installing the Tenant Verification India Chrome extension on your browser.

## 📋 Prerequisites

Before installing the extension, ensure you have:

- **Google Chrome Browser**: Version 88 or higher
- **Internet Connection**: Required for verification services
- **Administrator Access**: May be required for some installations
- **Valid API Keys**: Optional for demo mode (real verification requires API keys)

## 🚀 Installation Methods

### Method 1: Chrome Web Store (Recommended)

1. **Open Chrome Web Store**
   - Go to [Chrome Web Store](https://chrome.google.com/webstore)
   - Search for "Tenant Verification India"

2. **Install Extension**
   - Click on the extension listing
   - Click "Add to Chrome" button
   - Confirm the installation when prompted

3. **Verify Installation**
   - Look for the extension icon in your Chrome toolbar
   - Click the icon to open the verification interface

### Method 2: Developer Mode Installation

#### Step 1: Download Extension Files

1. **Download the Extension**
   ```bash
   # Clone from GitHub
   git clone https://github.com/varunschaudhari/tenant-verification-extension.git
   
   # Or download ZIP file
   # Extract the ZIP to a folder on your computer
   ```

2. **Verify Files**
   Ensure you have all required files:
   ```
   tenant-verification-extension/
   ├── manifest.json
   ├── popup.html
   ├── popup.css
   ├── popup.js
   ├── background.js
   ├── content.js
   ├── content.css
   ├── api-integration.js
   └── icons/
       ├── icon16.png
       ├── icon32.png
       ├── icon48.png
       └── icon128.png
   ```

#### Step 2: Enable Developer Mode

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar
   - Press Enter

2. **Enable Developer Mode**
   - Look for "Developer mode" toggle in the top-right corner
   - Click to enable it
   - You'll see additional options appear

#### Step 3: Load Extension

1. **Load Unpacked Extension**
   - Click "Load unpacked" button
   - Navigate to the folder containing the extension files
   - Select the folder and click "Select Folder"

2. **Verify Installation**
   - The extension should appear in your extensions list
   - Look for the extension icon in your Chrome toolbar
   - Status should show "Enabled"

#### Step 4: Generate Icons (If Missing)

If the icon files are missing:

1. **Open Icon Generator**
   - Open `generate-icons.html` in your browser
   - Follow the instructions to generate icons
   - Save the generated PNG files to the `icons/` folder

2. **Reload Extension**
   - Go back to `chrome://extensions/`
   - Click the refresh icon on the extension card
   - The icons should now appear

## ⚙️ Configuration

### Initial Setup

1. **Open Extension**
   - Click the extension icon in your toolbar
   - The popup interface will open

2. **Configure Settings**
   - Click the "Settings" button
   - Configure your preferences:
     - Auto-scan pages for tenant forms
     - Show notifications
     - Save verification history

3. **API Configuration (Optional)**
   - For real verification services, add your API keys
   - Leave empty for demo mode

### API Keys Setup

To use real verification services, you'll need API keys from:

1. **UIDAI API Key**
   - Visit [UIDAI Developer Portal](https://developer.uidai.gov.in)
   - Register for an account
   - Apply for API access
   - Get your API key

2. **Income Tax API Key**
   - Visit [Income Tax Department](https://incometax.gov.in)
   - Register for API access
   - Obtain your API key

3. **Telecom API Key**
   - Contact your preferred telecom provider
   - Request API access for verification services
   - Get your API credentials

4. **Police API Key**
   - Contact local police department
   - Request access to criminal record database
   - Obtain your API key

## 🔧 Troubleshooting

### Common Issues

#### Extension Not Loading

**Problem**: Extension doesn't appear in Chrome toolbar

**Solutions**:
1. Check if Developer mode is enabled
2. Verify all required files are present
3. Check Chrome console for errors
4. Try reloading the extension

```bash
# Check file structure
ls -la tenant-verification-extension/

# Verify manifest.json is valid
cat manifest.json | python -m json.tool
```

#### Missing Icons

**Problem**: Extension icon doesn't appear

**Solutions**:
1. Generate icons using `generate-icons.html`
2. Ensure icon files are in the correct location
3. Check file permissions
4. Reload the extension

#### Permission Errors

**Problem**: Extension shows permission errors

**Solutions**:
1. Check manifest.json permissions
2. Ensure host permissions are correct
3. Grant necessary permissions when prompted
4. Restart Chrome if needed

#### API Connection Issues

**Problem**: Verification fails with API errors

**Solutions**:
1. Check internet connection
2. Verify API keys are correct
3. Check API service status
4. Use demo mode for testing

### Error Messages

#### "Extension could not be loaded"

- Check if all files are present
- Verify manifest.json syntax
- Ensure Chrome version is compatible

#### "Permission denied"

- Check file permissions
- Run Chrome as administrator if needed
- Verify folder access rights

#### "API key invalid"

- Verify API key format
- Check if API key is active
- Contact API provider for support

## 🧪 Testing Installation

### Basic Functionality Test

1. **Open Extension**
   - Click the extension icon
   - Verify popup opens correctly

2. **Test Form**
   - Fill in sample tenant information
   - Click "Verify Tenant"
   - Check if results appear

3. **Test Website Integration**
   - Visit a rental website
   - Check if verification buttons appear
   - Test floating widget

### Advanced Testing

1. **Context Menu Test**
   - Select text on any webpage
   - Right-click and choose "Verify Tenant Information"
   - Verify widget opens with selected text

2. **Keyboard Shortcut Test**
   - Press Ctrl+Shift+V
   - Verify verification widget opens

3. **Settings Test**
   - Open settings
   - Change preferences
   - Verify changes are saved

## 🔒 Security Considerations

### Data Protection

1. **API Keys**
   - Store API keys securely
   - Don't share keys publicly
   - Rotate keys regularly

2. **User Data**
   - Verify data encryption
   - Check privacy settings
   - Review data retention policies

3. **Permissions**
   - Only grant necessary permissions
   - Review permission requests
   - Monitor extension behavior

### Privacy Settings

1. **Local Storage**
   - Check what data is stored locally
   - Clear data when needed
   - Review storage permissions

2. **Network Requests**
   - Monitor API calls
   - Verify HTTPS connections
   - Check for data leaks

## 📱 Mobile Installation

### Chrome Mobile

1. **Install on Mobile Chrome**
   - Follow same steps as desktop
   - Extension will work on mobile Chrome
   - Interface adapts to mobile screen

2. **Mobile Limitations**
   - Some features may be limited
   - Touch interface optimized
   - Smaller screen considerations

### Alternative Mobile Solutions

1. **Progressive Web App**
   - Install as PWA if available
   - Works offline
   - Native app-like experience

2. **Mobile App**
   - Download from app stores
   - Full mobile optimization
   - Native features

## 🔄 Updates

### Automatic Updates

1. **Chrome Web Store**
   - Updates automatically
   - No manual intervention needed
   - Version tracking available

2. **Developer Mode**
   - Manual updates required
   - Download new version
   - Reload extension

### Update Process

1. **Backup Current Version**
   ```bash
   cp -r tenant-verification-extension tenant-verification-backup
   ```

2. **Download New Version**
   ```bash
   git pull origin main
   # Or download new ZIP file
   ```

3. **Reload Extension**
   - Go to `chrome://extensions/`
   - Click refresh icon on extension
   - Verify new version loads

## 🆘 Support

### Getting Help

1. **Documentation**
   - Check this installation guide
   - Review README.md
   - Consult other guide files

2. **Community Support**
   - GitHub Issues
   - Community forums
   - User groups

3. **Professional Support**
   - Contact development team
   - Email support
   - Phone support

### Contact Information

- **Email**: support@tenantverification.in
- **Website**: https://tenantverification.in
- **GitHub**: https://github.com/varunschaudhari/tenant-verification-extension
- **Documentation**: https://docs.tenantverification.in

## 📋 Checklist

### Pre-Installation
- [ ] Chrome browser version 88+
- [ ] Internet connection available
- [ ] Administrator access (if needed)
- [ ] Extension files downloaded

### Installation
- [ ] Developer mode enabled
- [ ] Extension loaded successfully
- [ ] Icon appears in toolbar
- [ ] Popup opens correctly

### Configuration
- [ ] Settings configured
- [ ] API keys added (if needed)
- [ ] Permissions granted
- [ ] Privacy settings reviewed

### Testing
- [ ] Basic functionality works
- [ ] Website integration tested
- [ ] Context menu works
- [ ] Keyboard shortcuts work

### Security
- [ ] API keys secured
- [ ] Privacy settings configured
- [ ] Permissions reviewed
- [ ] Data protection verified

---

**Need Help?** If you encounter any issues during installation, please refer to the troubleshooting section or contact our support team.

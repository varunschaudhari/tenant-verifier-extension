# Testing Guide - Tenant Verification India Extension

## 🧪 Testing Overview

This guide provides comprehensive testing procedures for the Tenant Verification India Chrome extension across various rental websites and platforms.

## 📋 Pre-Testing Checklist

### Environment Setup
- [ ] Chrome browser (version 88 or higher)
- [ ] Extension loaded in developer mode
- [ ] Test data prepared (sample tenant information)
- [ ] Network connection stable
- [ ] Developer tools open for debugging

### Test Data Preparation
```javascript
// Sample test data
const testTenants = [
    {
        name: "Rajesh Kumar Sharma",
        phone: "9876543210",
        aadhaar: "123456789012",
        pan: "ABCDE1234F",
        email: "rajesh.sharma@test.com"
    },
    {
        name: "Priya Patel",
        phone: "8765432109",
        aadhaar: "987654321098",
        pan: "FGHIJ5678K",
        email: "priya.patel@test.com"
    }
];
```

## 🏠 Rental Website Testing

### 1. Magicbricks.com
**URL**: https://www.magicbricks.com/

**Test Scenarios**:
- [ ] Property listing page
- [ ] Contact owner form
- [ ] Tenant application form
- [ ] Property details page

**Expected Behavior**:
- Extension should detect rental-related forms
- "Verify Tenant" buttons should appear
- Floating widget should be accessible
- Context menu should work on tenant information

**Test Steps**:
1. Navigate to a rental property listing
2. Look for "Contact Owner" or "Apply Now" buttons
3. Fill in tenant information form
4. Verify extension integration
5. Test verification functionality

### 2. 99acres.com
**URL**: https://www.99acres.com/

**Test Scenarios**:
- [ ] Property search results
- [ ] Property detail pages
- [ ] Contact forms
- [ ] Rental applications

**Expected Behavior**:
- Form detection should work
- Verification buttons should appear
- Widget should be functional
- Results should display correctly

### 3. Housing.com
**URL**: https://www.housing.com/

**Test Scenarios**:
- [ ] Rental listings
- [ ] Contact forms
- [ ] Application processes
- [ ] Property details

**Expected Behavior**:
- Extension should integrate seamlessly
- No conflicts with existing functionality
- Verification process should work smoothly

### 4. NoBroker.in
**URL**: https://www.nobroker.in/

**Test Scenarios**:
- [ ] Property listings
- [ ] Tenant verification forms
- [ ] Contact owner features
- [ ] Application processes

**Expected Behavior**:
- Should work with their existing verification system
- No interference with platform functionality
- Enhanced verification capabilities

### 5. CommonFloor.com
**URL**: https://www.commonfloor.com/

**Test Scenarios**:
- [ ] Rental property pages
- [ ] Contact forms
- [ ] Application processes
- [ ] Property details

## 🔧 Functional Testing

### Core Features Testing

#### 1. Popup Interface
**Test Cases**:
- [ ] Extension icon click opens popup
- [ ] Form validation works correctly
- [ ] Input formatting functions properly
- [ ] Submit button triggers verification
- [ ] Results display correctly
- [ ] Clear form functionality works

**Test Steps**:
```javascript
// Test form validation
const testCases = [
    { name: "", phone: "123", expected: "Name required" },
    { name: "Test", phone: "", expected: "Phone required" },
    { name: "Test", phone: "1234567890", expected: "Success" }
];
```

#### 2. Content Script Integration
**Test Cases**:
- [ ] Form detection on page load
- [ ] Dynamic form detection
- [ ] Button injection works
- [ ] Widget positioning correct
- [ ] No conflicts with existing elements

**Test Steps**:
1. Load a rental website
2. Check for injected verification buttons
3. Test floating widget functionality
4. Verify context menu integration

#### 3. Background Script
**Test Cases**:
- [ ] Message handling works
- [ ] Storage operations function
- [ ] API calls execute properly
- [ ] Error handling works
- [ ] Rate limiting functions

#### 4. API Integration
**Test Cases**:
- [ ] Aadhaar verification API calls
- [ ] PAN verification API calls
- [ ] Phone verification API calls
- [ ] Email verification API calls
- [ ] Background check API calls
- [ ] Rental history API calls

### Performance Testing

#### Load Testing
- [ ] Extension loads within 2 seconds
- [ ] Popup opens instantly
- [ ] Form submission responds within 5 seconds
- [ ] No memory leaks during extended use

#### Stress Testing
- [ ] Multiple rapid verifications
- [ ] Large form data handling
- [ ] Network timeout scenarios
- [ ] Rate limit handling

### Security Testing

#### Data Protection
- [ ] Sensitive data not stored in plain text
- [ ] API keys properly secured
- [ ] No data leakage in console logs
- [ ] Secure transmission of verification data

#### Privacy Compliance
- [ ] User consent for data processing
- [ ] Data retention policies followed
- [ ] GDPR compliance (if applicable)
- [ ] Indian data protection compliance

## 🐛 Bug Testing Scenarios

### Common Issues to Test

#### 1. Form Detection Issues
**Problem**: Extension doesn't detect rental forms
**Test**: Try different form structures and naming conventions

#### 2. Styling Conflicts
**Problem**: Extension UI conflicts with website CSS
**Test**: Check on various websites with different themes

#### 3. JavaScript Conflicts
**Problem**: Extension breaks website functionality
**Test**: Verify no interference with existing scripts

#### 4. API Failures
**Problem**: Verification APIs return errors
**Test**: Simulate network failures and API errors

#### 5. Storage Issues
**Problem**: Verification history not saved
**Test**: Check Chrome storage API functionality

## 📊 Test Results Documentation

### Test Report Template

```markdown
## Test Report - [Website Name]

**Date**: [Date]
**Tester**: [Name]
**Extension Version**: [Version]

### Test Results

#### ✅ Passed Tests
- [ ] Form detection
- [ ] Button injection
- [ ] Verification process
- [ ] Results display

#### ❌ Failed Tests
- [ ] Issue description
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior

#### ⚠️ Issues Found
- [ ] Minor issues
- [ ] Performance concerns
- [ ] UI/UX improvements

### Screenshots
[Attach relevant screenshots]

### Console Logs
[Include any error logs or relevant console output]
```

## 🚀 Automated Testing

### Selenium Test Scripts

```python
# Example Selenium test for extension
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def test_extension_on_magicbricks():
    driver = webdriver.Chrome()
    driver.get("https://www.magicbricks.com/")
    
    # Test extension functionality
    # Add specific test steps here
    
    driver.quit()
```

### Jest Unit Tests

```javascript
// Example Jest test for API integration
describe('VerificationAPI', () => {
    test('should verify Aadhaar number', async () => {
        const api = new VerificationAPI();
        const result = await api.verifyAadhaar('123456789012');
        expect(result.verified).toBeDefined();
    });
});
```

## 📱 Cross-Browser Testing

### Browser Compatibility
- [ ] Chrome (Primary)
- [ ] Edge (Chromium-based)
- [ ] Opera
- [ ] Brave

### Version Testing
- [ ] Chrome 88+
- [ ] Chrome 90+
- [ ] Chrome 100+
- [ ] Latest stable version

## 🔄 Regression Testing

### Before Each Release
- [ ] All previous functionality works
- [ ] No new bugs introduced
- [ ] Performance maintained
- [ ] Security measures intact

### Automated Regression Suite
```bash
# Run automated tests
npm run test:regression

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

## 📈 Performance Monitoring

### Key Metrics to Track
- Extension load time
- Verification response time
- Memory usage
- CPU usage
- Network requests

### Monitoring Tools
- Chrome DevTools Performance tab
- Chrome DevTools Memory tab
- Network tab for API calls
- Console for errors

## 🎯 User Acceptance Testing

### Test Scenarios for End Users
1. **Landlord Testing**
   - Verify tenant information
   - Review verification results
   - Download verification reports

2. **Property Manager Testing**
   - Bulk verification processes
   - Report generation
   - History management

3. **Real Estate Agent Testing**
   - Quick verification on property sites
   - Client verification services
   - Report sharing

## 📝 Bug Reporting

### Bug Report Template

```markdown
**Bug Title**: [Clear description]

**Severity**: [Critical/High/Medium/Low]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]

**Actual Behavior**: [What actually happens]

**Environment**:
- Browser: [Version]
- Extension Version: [Version]
- Website: [URL]
- OS: [Operating System]

**Screenshots**: [If applicable]

**Console Logs**: [Error messages]

**Additional Notes**: [Any other relevant information]
```

## ✅ Testing Checklist

### Pre-Release Testing
- [ ] All core features tested
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] User acceptance testing done
- [ ] Documentation updated
- [ ] Bug fixes verified

### Post-Release Testing
- [ ] Monitor user feedback
- [ ] Track performance metrics
- [ ] Monitor error rates
- [ ] User satisfaction surveys
- [ ] Continuous improvement

---

**Note**: This testing guide should be updated regularly as new features are added and new rental websites emerge.

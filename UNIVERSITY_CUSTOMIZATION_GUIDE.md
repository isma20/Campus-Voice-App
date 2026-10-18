# University Customization Guide

This document outlines the changes made to make the Voice Campus app standard and formal for university use, and provides instructions for customizing it with your university's specific details.

## Changes Implemented

### 1. **Visual Design Updates**
- ✅ **Blue to Purple Gradient Theme**: Changed from green theme to a professional blue-to-purple gradient
- ✅ **White Background**: Clean white background for better contrast and readability
- ✅ **App Logo**: Added a graduation cap emoji (🎓) as a logo placeholder in the authentication screen
- ✅ **Gradient Headers**: All headers now use the blue-to-purple gradient effect

### 2. **University Branding Elements**
- ✅ **Logo Placeholder**: Added app logo container (currently using emoji, can be replaced with actual logo image)
- ✅ **University Name**: Added placeholders for university name throughout the app
- ✅ **Contact Information**: Added footer with contact details, terms, and privacy policy links
- ✅ **Formal Headers**: Updated headers to include "University Management System" subtitle

### 3. **Remember Me Functionality**
- ✅ **Save Email/ID**: Added "Remember my email" checkbox for both student and admin login
- ✅ **Save Student ID**: Added "Save my email and ID" checkbox for student registration
- ✅ **Auto-fill**: Email and Student ID are automatically filled on next visit if saved
- ✅ **LocalStorage**: Uses browser localStorage to persist credentials securely

### 4. **Formal University Details**
- ✅ **Footer Section**: Added footer with:
  - Terms of Service link
  - Privacy Policy link
  - Contact Support link
  - University name and address
  - Copyright information
- ✅ **Formal Labels**: Updated form labels to be more professional (e.g., "University Email" instead of "Email")
- ✅ **Placeholder Text**: Updated placeholders to show university email format

### 5. **Validation Enhancements**
- ✅ **Email Domain Validation**: Validates that emails use university domain
- ✅ **Student ID Validation**: Validates student ID format (6-12 alphanumeric characters)
- ✅ **Password Length**: Enforces minimum 6 character password
- ✅ **Better Error Messages**: More descriptive error messages for validation failures

## Customization Instructions

### Step 1: Update University Configuration

Edit `app/src/main/assets/app.js` and update the `UNIVERSITY_CONFIG` object:

```javascript
const UNIVERSITY_CONFIG = {
    emailDomain: '@youruniversity.edu', // Your university email domain
    studentIdPattern: /^[A-Z0-9]{6,12}$/i, // Adjust pattern as needed
    allowedEmailDomains: ['@youruniversity.edu', '@edu.youruniversity.edu'] // Add all valid domains
};
```

### Step 2: Update University Information

Edit `app/src/main/assets/index.html` and update the footer section:

```html
<div class="university-info">
    <div class="university-name">Your University Name</div>
    <div>Your University Address, City, State ZIP</div>
    <div>© 2024 Your University Name. All rights reserved.</div>
</div>
```

Also update the contact information in the footer links:
```html
<a href="#" onclick="alert('Contact: support@youruniversity.edu | Phone: (555) 123-4567')">Contact Support</a>
```

### Step 3: Add University Logo

Replace the emoji logo with your actual university logo:

1. Add your logo image to `app/src/main/res/drawable/` (e.g., `university_logo.png`)
2. Update the logo container in `index.html`:
```html
<div class="logo-container">
    <img src="university_logo.png" alt="University Logo" style="width: 80px; height: 80px; border-radius: 50%;">
</div>
```

Or if using an Android drawable resource, you may need to load it differently in the WebView.

### Step 4: Update Terms of Service and Privacy Policy

Replace the alert messages with actual links to your university's terms and privacy policy pages:

```html
<a href="https://youruniversity.edu/terms" target="_blank">Terms of Service</a>
<a href="https://youruniversity.edu/privacy" target="_blank">Privacy Policy</a>
```

### Step 5: Update App Name

The app name is already updated in `app/src/main/res/values/strings.xml`. You can further customize it if needed.

## Features Added

### Remember Me Functionality
- **How it works**: When users check "Remember my email" or "Save my email and ID", their credentials are saved in browser localStorage
- **Security**: Only email and student ID are saved (passwords are NEVER saved)
- **Auto-fill**: On next visit, saved credentials are automatically filled in the form
- **Clear data**: Users can uncheck the box to clear saved credentials

### Email Validation
- Validates that email addresses use approved university domains
- Shows helpful error messages if email doesn't match university domain
- Configurable through `UNIVERSITY_CONFIG.allowedEmailDomains`

### Student ID Validation
- Validates format: 6-12 alphanumeric characters (configurable)
- Shows helpful error messages for invalid formats
- Pattern can be customized in `UNIVERSITY_CONFIG.studentIdPattern`

## Necessary Details for University Use

The following details should be added/customized:

1. **University Name**: Update in footer and headers
2. **University Address**: Add in footer
3. **Contact Information**: 
   - Support email
   - Support phone number
   - Office hours (optional)
4. **Email Domains**: Configure allowed email domains
5. **Student ID Format**: Adjust validation pattern to match your university's ID format
6. **Logo**: Replace emoji with actual university logo
7. **Terms of Service**: Link to actual terms page
8. **Privacy Policy**: Link to actual privacy policy page
9. **Admin Access Code**: Consider changing from "ADMIN" to a more secure code
10. **Color Scheme**: The gradient colors can be adjusted in `styles.css` if needed

## Technical Notes

- **LocalStorage**: Credentials are saved in browser localStorage, which persists across sessions
- **Security**: Passwords are never saved, only email and student ID
- **Validation**: Client-side validation is implemented; server-side validation should also be added
- **Responsive**: All changes maintain responsive design for mobile devices

## Testing Checklist

- [ ] Test login with saved credentials
- [ ] Test registration with email validation
- [ ] Test student ID validation
- [ ] Test remember me checkbox (check and uncheck)
- [ ] Verify footer links work
- [ ] Test on different screen sizes
- [ ] Verify gradient theme displays correctly
- [ ] Test error messages for invalid inputs

## Next Steps

1. Replace placeholder university information with actual details
2. Add actual university logo
3. Configure email domains and student ID patterns
4. Set up actual Terms of Service and Privacy Policy pages
5. Test all functionality with real university data
6. Consider adding server-side validation
7. Review and update admin access code
8. Add any additional university-specific features as needed


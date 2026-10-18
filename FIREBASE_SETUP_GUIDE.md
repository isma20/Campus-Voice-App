# Step-by-Step Firebase Setup Guide

Follow these steps to get your Firebase credentials and update the configuration file.

## Step 1: Open Firebase Console

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account
3. You should see your "Voice Campus" project in the list
4. **Click on your "Voice Campus" project** to open it

## Step 2: Access Project Settings

1. In your Firebase project, look for the **gear icon (⚙️)** in the top left corner, next to "Project Overview"
2. **Click on the gear icon**
3. From the dropdown menu, select **"Project settings"**

## Step 3: Find Your Web App Configuration

1. In the Project Settings page, scroll down to find the section called **"Your apps"**
2. You'll see different platform icons (iOS, Android, Web, etc.)
3. **Click on the Web icon** (it looks like `</>` or `</> </>`)
   - If you haven't created a web app yet, click **"Add app"** and then select the Web icon
   - Give it a nickname like "Voice Campus Web" (optional)
   - Click **"Register app"**

## Step 4: Copy Your Firebase Configuration

After clicking the Web icon, you'll see a code snippet that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "voice-campus-xxxxx.firebaseapp.com",
  projectId: "voice-campus-xxxxx",
  storageBucket: "voice-campus-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**You need to copy these 6 values:**
- `apiKey` - A long string starting with "AIza..."
- `authDomain` - Usually "your-project-id.firebaseapp.com"
- `projectId` - Your project ID (e.g., "voice-campus-xxxxx")
- `storageBucket` - Usually "your-project-id.appspot.com"
- `messagingSenderId` - A number (e.g., "123456789012")
- `appId` - A string starting with "1:" (e.g., "1:123456789012:web:abcdef...")

## Step 5: Update firebase-config.js

1. Open the file `firebase-config.js` in your project
2. Replace each placeholder value with the actual values you copied:

**Example:**
- Replace `"YOUR_API_KEY"` with your actual `apiKey` value
- Replace `"YOUR_PROJECT_ID"` in `authDomain` with your actual `projectId`
- Replace `"YOUR_PROJECT_ID"` in `projectId` with your actual `projectId`
- Replace `"YOUR_PROJECT_ID"` in `storageBucket` with your actual `projectId`
- Replace `"YOUR_MESSAGING_SENDER_ID"` with your actual `messagingSenderId`
- Replace `"YOUR_APP_ID"` with your actual `appId`

## Step 6: Enable Authentication

1. In Firebase Console, go to **"Authentication"** in the left sidebar
2. Click **"Get started"** if you haven't set it up yet
3. Click on the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the "Email/Password" provider (toggle it ON)
6. Click **"Save"**

## Step 7: Create Firestore Database

1. In Firebase Console, go to **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll set up security rules later)
4. Choose a location for your database (select the closest to your users)
5. Click **"Enable"**

## Step 8: Set Up Security Rules (Important!)

1. In Firestore Database, click on the **"Rules"** tab
2. Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // All authenticated users can read notices
    match /notices/{noticeId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
    
    // Students can read their own attendance
    match /attendance/{attendanceId} {
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow write: if false;
    }
    
    // Students can create and read their own reports
    match /reports/{reportId} {
      allow create: if request.auth != null && 
        request.resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

## Step 9: Test Your Setup

1. Open `index.html` in your browser (using a local server)
2. Try to register a new account
3. If everything is configured correctly, you should be able to register and login!

## Troubleshooting

**If you get errors:**
- Make sure all 6 values in `firebase-config.js` are correct (no extra spaces, quotes are correct)
- Make sure Authentication is enabled
- Make sure Firestore Database is created
- Check the browser console (F12) for specific error messages

**Common mistakes:**
- Forgetting to remove quotes around placeholder text
- Copying extra spaces
- Not enabling Email/Password authentication
- Not creating the Firestore database


# How to Find the Config Code in Firebase Console

## What You're Looking For

The config code is a JavaScript object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "voice-campus-xxxxx.firebaseapp.com",
  projectId: "voice-campus-xxxxx",
  storageBucket: "voice-campus-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```

## Step-by-Step: Where to Find It

### Step 1: Open Your Project
1. Go to https://console.firebase.google.com/
2. Click on your **"Voice Campus"** project

### Step 2: Go to Project Settings
1. Look at the **top left corner** of the page
2. You'll see a **gear icon (⚙️)** next to "Project Overview"
3. **Click on the gear icon**
4. Select **"Project settings"** from the dropdown

### Step 3: Scroll to "Your apps" Section
1. In the Project Settings page, scroll down
2. Look for a section titled **"Your apps"** or **"SDK setup and configuration"**
3. You'll see platform icons: 
   - 📱 iOS (Apple icon)
   - 🤖 Android (Android icon)
   - 🌐 Web (</> icon) ← **THIS IS THE ONE YOU NEED!**

### Step 4: Click the Web Icon
1. **Click on the Web icon** (it looks like `</>` or has "web" written on it)
2. If you haven't created a web app yet:
   - Click **"Add app"** button
   - Then click the **Web icon**
   - Enter a nickname (optional, like "Voice Campus Web")
   - Click **"Register app"**

### Step 5: Find the Config Code
After clicking the Web icon, you'll see a page with code. There might be different options:

**Option 1: Firebase SDK snippet**
You'll see a code block that starts with:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  ...
};
```
**THIS IS THE ONE!** Copy these values.

**Option 2: npm install option**
If you see something like:
```bash
npm install firebase
```
**Skip this** - you don't need it. Look for the `firebaseConfig` object instead.

**Option 3: CDN option**
You might see:
```html
<script src="https://www.gstatic.com/firebasejs/..."></script>
```
**This is also fine** - but you still need the `firebaseConfig` object below it.

## Visual Guide - What It Looks Like

When you click the Web icon, you should see something like this:

```
┌─────────────────────────────────────────┐
│  Add Firebase SDK                       │
├─────────────────────────────────────────┤
│                                         │
│  Option 1: Use a <script> tag          │
│  [Script tags shown here]              │
│                                         │
│  Option 2: Use npm                     │
│  [npm install command]                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ const firebaseConfig = {         │   │
│  │   apiKey: "AIzaSy...",          │   │
│  │   authDomain: "...",            │   │
│  │   projectId: "...",             │   │
│  │   storageBucket: "...",         │   │
│  │   messagingSenderId: "...",     │   │
│  │   appId: "1:..."                │   │
│  │ };                               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Continue to console] button          │
└─────────────────────────────────────────┘
```

**The code block with `firebaseConfig` is what you need!**

## What to Copy

You need to copy the **6 values** inside the `firebaseConfig` object:
1. `apiKey` - The long string in quotes
2. `authDomain` - The URL in quotes
3. `projectId` - Your project ID in quotes
4. `storageBucket` - The URL in quotes
5. `messagingSenderId` - The number in quotes
6. `appId` - The string starting with "1:" in quotes

## Still Can't Find It?

If you don't see a Web app:
1. In the "Your apps" section, click **"Add app"** or the **"+"** button
2. Select the **Web icon** (`</>`)
3. Register the app
4. Then you'll see the config code

## Quick Checklist

- [ ] I'm in my "Voice Campus" project
- [ ] I clicked the gear icon (⚙️)
- [ ] I selected "Project settings"
- [ ] I scrolled to "Your apps" section
- [ ] I clicked the Web icon (`</>`)
- [ ] I can see a code block with `const firebaseConfig = { ... }`
- [ ] I can see 6 values: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId

If you checked all boxes, you found it! 🎉


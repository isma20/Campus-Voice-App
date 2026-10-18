# Voice Campus - Deployment Guide

This guide covers deploying your Voice Campus app in two ways:
1. **Android App** (APK/AAB for Google Play Store or direct distribution)
2. **Web App** (hosted on Firebase Hosting, Netlify, Vercel, etc.)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ Firebase project configured with Authentication and Firestore
- ✅ Firebase security rules deployed (see `RULES_TO_COPY.txt` or `FIRESTORE_SECURITY_RULES.txt`)
- ✅ `firebase-config.js` file with your Firebase credentials
- ✅ Android Studio installed (for Android deployment)
- ✅ Firebase CLI installed (for web deployment)

---

## Option 1: Deploy as Android App

### A. Build Release APK (For Direct Distribution)

1. **Open the project in Android Studio**
   - Open Android Studio
   - File → Open → Select the `Voice_Campus_03` folder

2. **Configure Signing (Required for Release)**
   
   Create a keystore file:
   ```bash
   keytool -genkey -v -keystore voice-campus-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias voice-campus
   ```
   
   Save the keystore file in the `app` directory and remember:
   - Keystore password
   - Key alias
   - Key password

3. **Create `keystore.properties` file** in the project root:
   ```properties
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=voice-campus
   storeFile=voice-campus-key.jks
   ```

4. **Update `app/build.gradle.kts`** to add signing config:
   ```kotlin
   android {
       // ... existing code ...
       
       signingConfigs {
           create("release") {
               val keystorePropertiesFile = rootProject.file("keystore.properties")
               val keystoreProperties = java.util.Properties()
               if (keystorePropertiesFile.exists()) {
                   keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
                   storeFile = file(keystoreProperties["storeFile"] as String)
                   storePassword = keystoreProperties["storePassword"] as String
                   keyAlias = keystoreProperties["keyAlias"] as String
                   keyPassword = keystoreProperties["keyPassword"] as String
               }
           }
       }
       
       buildTypes {
           release {
               isMinifyEnabled = false
               signingConfig = signingConfigs.getByName("release")
               proguardFiles(
                   getDefaultProguardFile("proguard-android-optimize.txt"),
                   "proguard-rules.pro"
               )
           }
       }
   }
   ```

5. **Build Release APK**
   - In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Or via command line:
     ```bash
     ./gradlew assembleRelease
     ```
   - APK location: `app/build/outputs/apk/release/app-release.apk`

6. **Distribute the APK**
   - Share the APK file directly with users
   - Users need to enable "Install from Unknown Sources" to install

### B. Build Android App Bundle (AAB) for Google Play Store

1. **Follow steps 1-4 from above** (signing configuration)

2. **Build AAB**
   - In Android Studio: **Build → Build Bundle(s) / APK(s) → Build Bundle(s)**
   - Or via command line:
     ```bash
     ./gradlew bundleRelease
     ```
   - AAB location: `app/build/outputs/bundle/release/app-release.aab`

3. **Upload to Google Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create a new app or select existing
   - Go to **Production → Create new release**
   - Upload the `.aab` file
   - Fill in release notes
   - Submit for review

### C. Update App Version (Before Each Release)

In `app/build.gradle.kts`, update:
```kotlin
defaultConfig {
    versionCode = 2  // Increment for each release
    versionName = "1.1"  // Update version number
}
```

---

## Option 2: Deploy as Web App

### A. Deploy to Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   
   When prompted:
   - Select your Firebase project
   - Public directory: `.` (current directory)
   - Configure as single-page app: **No**
   - Set up automatic builds: **No** (or Yes if using CI/CD)

4. **Create `firebase.json`** (if not created):
   ```json
   {
     "hosting": {
       "public": ".",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**",
         "app/**",
         "gradle/**",
         "*.gradle.kts",
         "*.md",
         "*.txt"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

5. **Ensure required files are in root:**
   - `index.html`
   - `app.js`
   - `styles.css`
   - `firebase-config.js`

6. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

7. **Your app will be live at:**
   ```
   https://YOUR_PROJECT_ID.web.app
   ```
   or
   ```
   https://YOUR_PROJECT_ID.firebaseapp.com
   ```

### B. Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Create `netlify.toml`** in project root:
   ```toml
   [build]
     publish = "."
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Or use Netlify Dashboard:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your project folder
   - Configure build settings if needed

### C. Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** to configure your project

### D. Deploy to GitHub Pages

1. **Create `_config.yml`** in project root:
   ```yaml
   theme: jekyll-theme-minimal
   ```

2. **Push to GitHub repository**

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select source branch (usually `main`)
   - Save

4. **Your app will be at:**
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```

---

## Important: Before Deploying

### 1. Update Firebase Security Rules

Copy the rules from `RULES_TO_COPY.txt` to Firebase Console:
- Go to Firebase Console → Firestore Database → Rules
- Paste the rules
- Click **Publish**

### 2. Verify Firebase Config

Ensure `firebase-config.js` has your actual Firebase credentials (not placeholders).

### 3. Test Locally First

- **Web**: Use a local server (`python -m http.server 8000`)
- **Android**: Test on emulator or device before building release

### 4. Environment-Specific Configs (Optional)

For production, consider:
- Using environment variables for Firebase config
- Different Firebase projects for dev/staging/prod
- Enabling analytics and crash reporting

---

## Post-Deployment Checklist

- [ ] Firebase Authentication enabled
- [ ] Firestore Database created and rules deployed
- [ ] Firebase config updated with production credentials
- [ ] App tested on target devices/browsers
- [ ] Version number updated (for Android)
- [ ] App signed with release keystore (for Android)
- [ ] Custom domain configured (optional, for web)
- [ ] SSL/HTTPS enabled (automatic with Firebase Hosting, Netlify, Vercel)

---

## Troubleshooting

### Android Build Issues

**"Gradle sync failed"**
- File → Invalidate Caches / Restart
- Delete `.gradle` folder and rebuild

**"Signing config not found"**
- Verify `keystore.properties` exists and has correct values
- Check keystore file path in `build.gradle.kts`

**"APK not installing"**
- Ensure APK is signed
- Check `minSdk` version matches target device

### Web Deployment Issues

**"Firebase not initialized"**
- Check `firebase-config.js` has correct values
- Verify Firebase project is active
- Check browser console for errors

**"404 on routes"**
- Ensure rewrite rules are configured in hosting config
- For SPA routing, all routes should redirect to `index.html`

**"CORS errors"**
- Firebase Hosting automatically handles CORS
- For other hosts, configure CORS headers

---

## Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install -g firebase-tools
      - run: firebase deploy --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
```

Add token to GitHub Secrets: Settings → Secrets → Actions

---

## Support

For issues or questions:
- Check Firebase Console for errors
- Review browser console (F12) for web issues
- Check Android Logcat for Android issues
- Review Firebase documentation: https://firebase.google.com/docs


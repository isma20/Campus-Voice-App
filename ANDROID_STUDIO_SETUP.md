# Running Voice Campus in Android Studio

Your web app has been converted to run as an Android app using WebView!

## What Was Changed

1. ✅ **MainActivity.kt** - Updated to load your web app in a WebView
2. ✅ **AndroidManifest.xml** - Added internet permission
3. ✅ **Assets folder** - All web files (HTML, CSS, JS) are now in `app/src/main/assets/`

## How to Run

### Step 1: Open in Android Studio
1. Open Android Studio
2. Open your project: `Voice_Campus`

### Step 2: Sync Gradle
1. Android Studio should automatically sync Gradle
2. If not, click **File > Sync Project with Gradle Files**

### Step 3: Run the App
1. Connect an Android device via USB (with USB debugging enabled) OR
2. Start an Android Emulator (AVD Manager)
3. Click the **Run** button (green play icon) or press `Shift + F10`
4. Select your device/emulator
5. The app will build and install automatically!

## What You'll See

- The app will open showing the login screen
- All features work exactly as before:
  - Login/Register
  - View Notices
  - Check Attendance
  - Report Problems

## Important Notes

1. **Internet Required**: The app needs internet to connect to Firebase
2. **Firebase Config**: Already configured with your credentials in `assets/firebase-config.js`
3. **Back Button**: Pressing back will navigate within the web app, not exit immediately

## Troubleshooting

**If the app shows a blank screen:**
- Check that all files are in `app/src/main/assets/`
- Make sure internet permission is in AndroidManifest.xml
- Check Logcat for errors (View > Tool Windows > Logcat)

**If Firebase doesn't work:**
- Make sure your device/emulator has internet connection
- Verify Firebase config is correct in `assets/firebase-config.js`
- Check Logcat for Firebase errors

**If build fails:**
- Clean and rebuild: **Build > Clean Project**, then **Build > Rebuild Project**
- Invalidate caches: **File > Invalidate Caches / Restart**

## Building APK

To create an APK file:
1. **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Wait for build to complete
3. APK will be in `app/build/outputs/apk/debug/`

Enjoy your Android app! 🎉


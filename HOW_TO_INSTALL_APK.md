# How to Install APK from Android Studio

You have a debug APK built! Here are **3 easy ways** to install it on your Android device.

---

## Method 1: Direct Install from Android Studio (EASIEST) ⭐

This is the **fastest and easiest** method - Android Studio installs it automatically!

### Steps:

1. **Connect Your Android Device**
   - Connect your phone/tablet to your computer via USB cable
   - On your phone, when prompted, select **"File Transfer"** or **"MTP"** mode
   - Enable **USB Debugging** on your phone:
     - Go to **Settings → About Phone**
     - Tap **Build Number** 7 times (enables Developer Options)
     - Go back to **Settings → Developer Options**
     - Enable **USB Debugging**
     - When prompted on phone, tap **"Allow USB Debugging"** and check "Always allow"

2. **In Android Studio**
   - Make sure your device is connected and recognized
   - Click the **Run** button (green play icon ▶️) or press `Shift + F10`
   - Select your device from the list
   - Android Studio will automatically:
     - Build the APK (if needed)
     - Install it on your device
     - Launch the app

3. **Done!** The app will open on your device automatically.

---

## Method 2: Transfer APK to Phone and Install Manually

### Step 1: Find Your APK File

Your APK is located at:
```
app\build\intermediates\apk\debug\app-debug.apk
```

Or build a fresh one:
1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. APK will be in: `app\build\outputs\apk\debug\app-debug.apk`

### Step 2: Transfer APK to Your Phone

**Option A: USB Cable**
1. Connect phone to computer via USB
2. On phone, select **"File Transfer"** mode
3. Copy `app-debug.apk` from your computer to your phone's **Downloads** folder
4. Disconnect phone

**Option B: Email/Cloud**
1. Email the APK to yourself
2. Open email on your phone
3. Download the APK attachment

**Option C: Google Drive/Dropbox**
1. Upload APK to Google Drive or Dropbox
2. Download it on your phone

### Step 3: Install on Phone

1. **Enable Unknown Sources** (if needed):
   - Go to **Settings → Security** (or **Settings → Apps → Special Access**)
   - Enable **"Install Unknown Apps"** or **"Unknown Sources"**
   - Select your file manager or browser (the app you'll use to open the APK)

2. **Open the APK**:
   - Open **Files** app (or any file manager)
   - Navigate to **Downloads** folder
   - Tap on `app-debug.apk`

3. **Install**:
   - Tap **"Install"** button
   - Wait for installation to complete
   - Tap **"Open"** to launch the app

---

## Method 3: Install via ADB Command Line

If you have ADB (Android Debug Bridge) installed:

### Steps:

1. **Connect device via USB** (with USB debugging enabled)

2. **Open Command Prompt or PowerShell** in your project folder

3. **Install using ADB**:
   ```bash
   adb install app\build\intermediates\apk\debug\app-debug.apk
   ```
   
   Or if the APK is in outputs folder:
   ```bash
   adb install app\build\outputs\apk\debug\app-debug.apk
   ```

4. **Check if device is connected**:
   ```bash
   adb devices
   ```
   You should see your device listed.

5. **Done!** The app will be installed and you can find it in your app drawer.

---

## Quick Troubleshooting

### "USB Debugging not working"
- Make sure USB Debugging is enabled in Developer Options
- Try different USB cable
- Try different USB port on computer
- Install phone drivers (if Windows doesn't recognize device)

### "Install blocked" or "Unknown Sources"
- Enable "Install Unknown Apps" in Settings → Security
- Some phones require enabling this per app (file manager/browser)

### "Device not recognized in Android Studio"
- Check USB connection
- Make sure USB Debugging is enabled
- Try revoking USB debugging authorizations and reconnect
- Restart Android Studio

### "APK won't install"
- Make sure you're not installing over a different signed version
- Uninstall any existing version first
- Check if device has enough storage space
- Make sure Android version on device meets minimum SDK (Android 7.0+)

### "App crashes after installation"
- Check Logcat in Android Studio for errors
- Verify Firebase config is correct
- Make sure device has internet connection

---

## Building a Fresh APK

If you need to build a new APK:

1. **In Android Studio:**
   - **Build → Build Bundle(s) / APK(s) → Build APK(s)**
   - Wait for "Build completed successfully" notification
   - Click **"locate"** in the notification to open the APK folder

2. **Or via Command Line:**
   ```bash
   .\gradlew assembleDebug
   ```
   APK will be in: `app\build\outputs\apk\debug\app-debug.apk`

---

## What's Next?

After installing:
- ✅ Test all features (Login, Notices, Attendance, Reports)
- ✅ Make sure Firebase connection works
- ✅ Test on different Android versions if possible

**For Production Release:**
- Build a **signed release APK** (see `DEPLOYMENT_GUIDE.md`)
- Or build an **AAB** for Google Play Store

---

## Need Help?

- Check Android Studio's **Logcat** for error messages
- Verify your device meets minimum requirements (Android 7.0+)
- Make sure Firebase is properly configured

Enjoy your app! 🎉


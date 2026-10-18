# Installing Emulator - Quick Steps

You're seeing the "Install Emulator" dialog. Here's what to do:

## Step 1: Click OK
1. In the dialog that says "No emulator installed. Please download the emulator."
2. Click the **OK** button (blue button)

## Step 2: SDK Manager Opens
After clicking OK, Android Studio will open the **SDK Manager** automatically.

## Step 3: Install System Image
1. In the SDK Manager, go to the **SDK Platforms** tab
2. Check the box for **Android 14.0 (API 34)** or the latest version
   - You'll see a checkbox next to it
   - Make sure "Android SDK Platform" is checked
3. Go to the **SDK Tools** tab
4. Check these items:
   - ✅ **Android Emulator**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)** - if on Windows with Intel CPU
   - ✅ **Google Play Intel x86 Atom System Images** - if you want Google Play
5. Click **Apply** or **OK**
6. Accept the license agreements
7. Wait for download and installation (this may take 10-30 minutes depending on your internet)

## Step 4: After Installation
1. Once installation completes, close SDK Manager
2. Go back to **Device Manager** (Tools > Device Manager)
3. Your Pixel 6 emulator should now be ready
4. Click the **Play** button (▶️) next to Pixel 6
5. Wait for emulator to boot (first time takes 2-5 minutes)

## Step 5: Run Your App
1. Once emulator is running, click **Run** button in Android Studio
2. Select your Pixel 6 emulator
3. Your Voice Campus app will launch!

## Alternative: Quick Install via Device Manager

If the dialog method doesn't work:

1. Close the dialog
2. In **Device Manager**, click the **Play** button (▶️) next to Pixel 6
3. If it says system image is missing, it will prompt you to download
4. Follow the prompts to download the required system image

## What's Being Downloaded?

- **Android System Image**: The Android OS that runs in the emulator (1-3 GB)
- **Emulator Tools**: Software needed to run the emulator
- **Platform Tools**: ADB and other development tools

## Troubleshooting

**If download fails:**
- Check your internet connection
- Try again - downloads can be interrupted
- Make sure you have enough disk space (at least 5 GB free)

**If installation is slow:**
- This is normal - system images are large files
- Be patient, it only needs to download once

**If you get errors:**
- Make sure Android Studio is up to date
- Check that you have write permissions to the SDK folder
- Try restarting Android Studio

Once the download completes, you'll be all set! 🚀





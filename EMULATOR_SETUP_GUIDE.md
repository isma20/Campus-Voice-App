# How to Install Android Emulator in Android Studio

Follow these steps to create and run an Android emulator for testing your Voice Campus app.

## Step 1: Open AVD Manager

1. Open **Android Studio**
2. Click on **Tools** in the top menu
3. Select **Device Manager** (or **AVD Manager** in older versions)
   - You can also click the device icon in the toolbar
   - Or use the shortcut: **View > Tool Windows > Device Manager**

## Step 2: Create Virtual Device

1. In the Device Manager window, click **Create Device** button (or **+ Create Virtual Device**)

## Step 3: Select Hardware

1. Choose a device definition:
   - **Recommended**: Select **Phone** category
   - Choose **Pixel 5** or **Pixel 6** (good for testing)
   - Or any phone model you prefer
2. Click **Next**

## Step 4: Select System Image

1. You'll see a list of Android system images
2. **Recommended**: Choose the latest **API Level** (e.g., API 34, API 33)
   - Look for ones marked **Recommended** or **Latest**
   - Make sure it has the **Download** link if not installed
3. If you see **Download** next to an image:
   - Click **Download**
   - Wait for download to complete (this may take several minutes)
   - Accept the license agreement
4. Once downloaded, select the system image
5. Click **Next**

## Step 5: Configure AVD

1. **AVD Name**: Give it a name (e.g., "Pixel_5_API_34")
2. **Startup orientation**: Choose Portrait (default)
3. **Advanced Settings** (optional):
   - RAM: 2048 MB or higher (recommended)
   - VM heap: 512 MB or higher
   - Internal Storage: 2048 MB or higher
4. Click **Finish**

## Step 6: Start the Emulator

1. In Device Manager, you'll see your new emulator listed
2. Click the **Play** button (▶️) next to your emulator
3. Wait for the emulator to boot (first time may take 2-5 minutes)
4. Once booted, you'll see the Android home screen

## Step 7: Run Your App

1. With the emulator running, go back to Android Studio
2. Click the **Run** button (green play icon) or press `Shift + F10`
3. Select your emulator from the device list
4. Your Voice Campus app will install and launch!

## Quick Tips

### If Download is Slow
- System images are large (1-3 GB), so download may take time
- Make sure you have stable internet connection
- You can download multiple API levels if needed

### Recommended Settings
- **RAM**: 2048 MB minimum (4096 MB if your computer has enough)
- **Graphics**: Automatic (uses your GPU if available)
- **Storage**: 2048 MB minimum

### Troubleshooting

**Emulator won't start:**
- Make sure **Virtualization** is enabled in your BIOS (for Intel/AMD)
- Check if Hyper-V is enabled (Windows)
- Try increasing RAM allocation

**Emulator is slow:**
- Increase RAM allocation
- Enable hardware acceleration
- Close other applications
- Use a lower API level (older Android version)

**Can't find AVD Manager:**
- Go to **Tools > Device Manager**
- Or **View > Tool Windows > Device Manager**

## Alternative: Use Physical Device

If emulator setup is difficult, you can use a real Android phone:

1. Enable **Developer Options** on your phone:
   - Go to **Settings > About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging**:
   - Go to **Settings > Developer Options**
   - Enable **USB Debugging**
3. Connect phone via USB
4. Allow USB debugging when prompted
5. Select your phone in Android Studio when running

## System Requirements

- **RAM**: 8 GB minimum (16 GB recommended)
- **Disk Space**: At least 2 GB free for system image
- **Processor**: 64-bit processor with virtualization support

That's it! Once your emulator is running, you can test your Voice Campus app! 🎉






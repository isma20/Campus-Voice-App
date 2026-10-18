# Quick Fix: Notice Publishing Permission Error

## The Problem
❌ **Error**: "Failed to publish notice: missing or insufficient permissions"

## The Solution (3 Steps)

### Step 1: Open Firebase Console
- Go to: https://console.firebase.google.com/
- Select project: **voice-campus**
- Click: **Firestore Database** → **Rules** tab

### Step 2: Copy & Paste Rules
Open the file `FIRESTORE_SECURITY_RULES.txt` and copy ALL the content, then paste it into the Rules editor in Firebase Console.

### Step 3: Publish
- Click the **"Publish"** button
- Wait 10-20 seconds
- Done! ✅

## Test It
1. Go back to your app
2. Login as admin
3. Try publishing a notice
4. Should work now! 🎉

## Need More Help?
See the detailed guide: `HOW_TO_FIX_NOTICE_PERMISSIONS.md`

## What Changed?
The security rules now:
- ✅ Allow admins to create/update/delete notices
- ✅ Allow admins to update reports
- ✅ Allow teachers to mark attendance
- ✅ Keep student data secure


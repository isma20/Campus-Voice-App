# How to Fix "Missing or Insufficient Permissions" Error for Notices

## Problem
When trying to publish a notice in the admin panel, you get the error: **"Failed to publish notice: missing or insufficient permissions"**

This happens because your Firestore security rules are blocking admin users from writing to the `notices` collection.

## Solution: Update Firestore Security Rules

### Step 1: Open Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **voice-campus**
3. Click on **"Firestore Database"** in the left sidebar
4. Click on the **"Rules"** tab at the top

### Step 2: Replace the Rules
Copy the entire content from `FIRESTORE_SECURITY_RULES.txt` file and paste it into the Rules editor in Firebase Console.

**OR** manually replace your current rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is teacher
    function isTeacher() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can write their own document
      allow write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all user documents
      allow read: if isAdmin();
    }
    
    // Notices collection
    match /notices/{noticeId} {
      // All authenticated users can read notices
      allow read: if request.auth != null;
      // Only admins can create, update, and delete notices
      allow create, update, delete: if isAdmin();
    }
    
    // Attendance collection
    match /attendance/{attendanceId} {
      // Students can read their own attendance
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      // Admins and teachers can read all attendance
      allow read: if isAdmin() || isTeacher();
      // Only teachers and admins can create attendance records
      allow create: if isTeacher() || isAdmin();
      // Only admins can update/delete attendance
      allow update, delete: if isAdmin();
    }
    
    // Reports collection
    match /reports/{reportId} {
      // Students can create reports
      allow create: if request.auth != null && 
        request.resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      // Students can read their own reports
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      // Admins can read all reports
      allow read: if isAdmin();
      // Only admins can update and delete reports
      allow update, delete: if isAdmin();
    }
  }
}
```

### Step 3: Publish the Rules
1. Click the **"Publish"** button at the top right
2. Wait for the confirmation message
3. Rules are now active!

### Step 4: Test
1. Go back to your app
2. Login as an admin user
3. Try publishing a notice
4. It should work now! ✅

## Important Notes

- **These rules check the user's role** from the `users` collection
- Make sure your admin users have `role: 'admin'` in their user document
- The rules use helper functions `isAdmin()` and `isTeacher()` to check permissions
- All authenticated users can **read** notices
- Only admins can **create, update, and delete** notices

## Troubleshooting

### Still getting permission errors?
1. **Check user role**: Make sure your admin account has `role: 'admin'` in the `users` collection
   - Go to Firestore Database > `users` collection
   - Find your user document (by UID)
   - Verify the `role` field is set to `'admin'`

2. **Check authentication**: Make sure you're logged in
   - The rules require `request.auth != null` (user must be authenticated)

3. **Wait a few seconds**: After publishing rules, wait 10-20 seconds for them to propagate

4. **Check browser console**: Open browser DevTools (F12) and check for any error messages

### Need to verify admin role?
If you need to manually set a user as admin:
1. Go to Firestore Database > `users` collection
2. Find the user document
3. Edit the document and add/update the `role` field to `'admin'`
4. Save

## Security Best Practices

These rules ensure:
- ✅ Students can only see their own data
- ✅ Admins have full access to manage notices and reports
- ✅ Teachers can mark attendance
- ✅ All users must be authenticated
- ✅ Role-based access control is enforced


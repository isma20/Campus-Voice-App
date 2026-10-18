# Voice Campus - Student Portal

A responsive web application for students to track notices, attendance, and report problems to administrators. Built with Firebase for authentication and database.

## Features

- **Authentication**: Secure login and registration system
- **Notices**: View all campus notices and announcements
- **Attendance Tracking**: View your attendance records with statistics
- **Problem Reporting**: Report issues to administrators with status tracking
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean design with white and green color scheme

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
4. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

### 2. Configure Firebase

Open `firebase-config.js` and replace the placeholder values with your Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Firestore Security Rules

In Firebase Console, go to Firestore Database > Rules and use these rules:

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
      allow write: if false; // Only admins can write (set up admin role separately)
    }
    
    // Students can read their own attendance
    match /attendance/{attendanceId} {
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow write: if false; // Only admins can write
    }
    
    // Students can create and read their own reports
    match /reports/{reportId} {
      allow create: if request.auth != null && 
        request.resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow read: if request.auth != null && 
        resource.data.studentId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.studentId;
      allow update, delete: if false; // Only admins can update/delete
    }
  }
}
```

### 4. Running the Application

#### Option 1: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```

#### Option 3: VS Code Live Server
- Install "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

Then open `http://localhost:8000` in your browser.

## Database Structure

### Collections

1. **users**
   - `name`: string
   - `email`: string
   - `studentId`: string
   - `role`: string (default: "student")
   - `createdAt`: timestamp

2. **notices**
   - `title`: string
   - `content`: string
   - `createdAt`: timestamp

3. **attendance**
   - `studentId`: string
   - `date`: timestamp
   - `status`: string ("present" or "absent")
   - `subject`: string (optional)

4. **reports**
   - `studentId`: string
   - `studentName`: string
   - `studentEmail`: string
   - `title`: string
   - `category`: string
   - `description`: string
   - `status`: string ("pending" or "resolved")
   - `createdAt`: timestamp

## Admin Features (To be implemented separately)

To add admin functionality, you would need to:
1. Add an `isAdmin` field to user documents
2. Create an admin dashboard
3. Update security rules to allow admins to write to notices, attendance, and update reports

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for educational purposes.


// Firebase Configuration
// EXAMPLE - Replace with YOUR actual values from Firebase Console
// DO NOT use these example values - they are just for reference!

const firebaseConfig = {
    // This is a LONG string starting with "AIza..." - copy it exactly
    apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
    
    // Format: "your-project-id.firebaseapp.com"
    // Replace "your-project-id" with your actual project ID
    authDomain: "voice-campus-abc123.firebaseapp.com",
    
    // This is your project ID (usually something like "voice-campus-abc123")
    projectId: "voice-campus-abc123",
    
    // Format: "your-project-id.appspot.com"
    // Replace "your-project-id" with your actual project ID
    storageBucket: "voice-campus-abc123.appspot.com",
    
    // This is a NUMBER (like "123456789012") - keep it as a string in quotes
    messagingSenderId: "123456789012",
    
    // This starts with "1:" followed by numbers and letters
    // Example: "1:123456789012:web:abcdef1234567890"
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();


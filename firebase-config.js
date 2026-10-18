// Firebase Configuration
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyALr5WH-6AUZfgC27yA9-ftrNeniftDUEg",
    authDomain: "voice-campus.firebaseapp.com",
    projectId: "voice-campus",
    storageBucket: "voice-campus.firebasestorage.app",
    messagingSenderId: "839534137556",
    appId: "1:839534137556:web:5399bbf930c3ac692c2b41"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();


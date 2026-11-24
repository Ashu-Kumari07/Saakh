/**
 * Firebase Phone Authentication Configuration Template
 * 
 * Instructions:
 * 1. Copy this file to `js/firebase-config.js`
 * 2. Replace the placeholder values with your Firebase Web App credentials
 * 3. Never commit `js/firebase-config.js` with real credentials to GitHub
 */
window.FIREBASE_CONFIG = {
    apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "PASTE_YOUR_PROJECT_ID",
    storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
    appId: "PASTE_YOUR_APP_ID"
};

function isFirebaseEnabled() {
    return typeof firebase !== 'undefined' &&
           window.FIREBASE_CONFIG &&
           window.FIREBASE_CONFIG.apiKey &&
           !window.FIREBASE_CONFIG.apiKey.startsWith('PASTE_');
}

function initFirebaseApp() {
    if (!isFirebaseEnabled()) return null;
    try {
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(window.FIREBASE_CONFIG);
        }
        return firebase.auth();
    } catch (err) {
        console.warn('[Firebase Init Warning]:', err.message);
        return null;
    }
}

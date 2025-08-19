// js/firebaseConfig.js
const firebaseConfig = {
  apiKey: "AIzaSyB-l13VDgX_EEJkB5mgee6UVkmtiFP8Yz0",
  authDomain: "doc-92a41.firebaseapp.com",
  projectId: "doc-92a41",
  storageBucket: "doc-92a41.appspot.com", // FIXED
  messagingSenderId: "51218274983",
  appId: "1:51218274983:web:e791b1c947c6749ba95982",
  measurementId: "G-VERD3W31LQ"
};

// Initialize Firebase (compat)
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 4) Debug
console.log("✅ Firebase initialized (compat), apps:", firebase.apps.length);

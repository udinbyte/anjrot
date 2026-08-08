// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyBPc2fA7R2pLZpcuyumQLAxsib4PsruE00",
  authDomain: "anrjot-mining.firebaseapp.com",
  projectId: "anrjot-mining",
  storageBucket: "anrjot-mining.firebasestorage.app",
  messagingSenderId: "1092911203362",
  appId: "1:1092911203362:web:e4a2390b34f041fa52767b",
  measurementId: "G-1PZ7W908B9"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;

/**
 * 
 * npm i redux react-redux @reduxjs/toolkit react-share
 // firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🔥 USERS COLLECTION
    match /users/{userId} {
      // Read: User hanya bisa baca data sendiri
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Write: User hanya bisa tulis data sendiri (kecuali field tertentu)
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Create: Hanya user baru yang bisa membuat doc sendiri
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // 🔥 Validasi field untuk mencegah perubahan tidak sah
      allow update: if request.auth != null && request.auth.uid == userId
        && (request.resource.data.diff(resource.data).affectedKeys.hasOnly([
          'balance',
          'assets',
          'transactions',
          'mining',
          'referrals',
          'daily',
          'displayName',
          'photoURL'
        ]));
    }
    
    // 🔥 PRESALE (Public Read, Admin Write)
    match /presale/{docId} {
      allow read: if request.auth != null;
      allow write: if false; // Hanya admin via Cloud Functions
    }
    
    // 🔥 PRICES (Public Read, Admin Write)
    match /prices/{symbol} {
      allow read: if request.auth != null;
      allow write: if false; // Hanya admin via Cloud Functions
    }
    
    // 🔥 TRANSACTIONS (Read/Write by owner)
    match /transactions/{txId} {
      allow read: if request.auth != null && 
        (resource.data.from == request.auth.uid || 
         resource.data.to == request.auth.uid);
      allow write: if request.auth != null && 
        (request.resource.data.from == request.auth.uid || 
         request.resource.data.to == request.auth.uid);
    }
    
    // 🔥 LEADERBOARD (Public Read, Admin Write)
    match /leaderboard/{docId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}


 */
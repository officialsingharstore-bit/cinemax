import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import CONFIG from '../config.js';

const app = initializeApp(CONFIG.FIREBASE);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    db, 
    googleProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc,
    setDoc
};

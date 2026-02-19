import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,    
    updateProfile,
    sendEmailVerification,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    setPersistence,          
    browserLocalPersistence, 
    browserSessionPersistence,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, remove, child, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAHm7h_cBloICm3XGOKUUw6MZwFd_MNOZo",
    authDomain: "picoteflix.firebaseapp.com",
    projectId: "picoteflix",
    storageBucket: "picoteflix.firebasestorage.app",
    messagingSenderId: "985133415083",
    appId: "1:985133415083:web:7ed4087042a9e4fc5955ee",
    measurementId: "G-VGVZ7VJTF8",
    databaseURL: "https://picoteflix-default-rtdb.firebaseio.com/"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

export { 
    auth, provider, signInWithPopup, signOut, onAuthStateChanged,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, 
    sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential, updatePassword,
    setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail,
    db, ref, set, get, remove, child, onValue
};
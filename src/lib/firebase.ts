import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAY415vxRrBI17XT9p4wi43NqQ9_auZRS8",
    authDomain: "figumatch.firebaseapp.com",
    projectId: "figumatch",
    storageBucket: "figumatch.firebasestorage.app",
    messagingSenderId: "470885440550",
    appId: "1:470885440550:web:a53c0a81351aec1b8f9ae7",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

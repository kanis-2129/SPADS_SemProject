// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLYlRAjSOkJJQoLoRK649I3jgRj2eNeTM",
  authDomain: "school-portal-5b71b.firebaseapp.com",
  projectId: "school-portal-5b71b",
  storageBucket: "school-portal-5b71b.firebasestorage.app",
  messagingSenderId: "12889518893",
  appId: "1:12889518893:web:6ce99756e62e1ff05fd9a4",
  measurementId: "G-R972TYRQ4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export const db = getFirestore(app);
export { auth };
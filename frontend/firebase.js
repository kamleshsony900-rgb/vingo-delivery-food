// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-4333d.firebaseapp.com",
  projectId: "vingo-food-delivery-4333d",
  storageBucket: "vingo-food-delivery-4333d.firebasestorage.app",
  messagingSenderId: "1040408467045",
  appId: "1:1040408467045:web:1f815b2ee0d55c0313588c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app,auth}
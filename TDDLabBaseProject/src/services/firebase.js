import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaJN2r1lxWi8Q6WQz5cfsd23uLHYJmeQg",
  authDomain: "homebound-b819e.firebaseapp.com",
  projectId: "homebound-b819e",
  storageBucket: "homebound-b819e.firebasestorage.app",
  messagingSenderId: "76671137341",
  appId: "1:76671137341:web:db2bd1101dac05c2c05c54",
  measurementId: "G-2646RKHQK6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const storage = getStorage(app);
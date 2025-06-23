import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB00AME_kwvdgF4iPN8irtYfuvFXIb0WUo",
    authDomain: "manajemenltt-172dc.firebaseapp.com",
    databaseURL: "https://manajemenltt-172dc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "manajemenltt-172dc",
    storageBucket: "manajemenltt-172dc.firebasestorage.app",
    messagingSenderId: "245040032200",
    appId: "1:245040032200:web:bc80314a36a1ce0d6b38fd",
    measurementId: "G-S9H03G5104"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;
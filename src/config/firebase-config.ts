import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDVeHyE8kxoNxDyOZd14S2WU0PySB8J-gs",
    authDomain: "fermento-vite.firebaseapp.com",
    databaseURL: "https://fermento-vite-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fermento-vite",
    storageBucket: "fermento-vite.firebasestorage.app",
    messagingSenderId: "448006545185",
    appId: "1:448006545185:web:d3e95e010038f607dee860",
    measurementId: "G-C7VMT1ES0N"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app); 
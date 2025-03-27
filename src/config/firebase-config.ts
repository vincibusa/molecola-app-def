import firebase from 'firebase/compat/app';
import 'firebase/compat/database'; // Importa il modulo per il Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyD6xAlpSbs--5sq48JDWVMZlee_gndU3Hg",
  authDomain: "molecola-pizzeria.firebaseapp.com",
  projectId: "molecola-pizzeria",
  storageBucket: "molecola-pizzeria.appspot.com",
  messagingSenderId: "720187459935",
  appId: "1:720187459935:web:42f3a01d1fa5fb71deceea",
  measurementId: "G-MP35B2FCHD",
  databaseURL: "https://molecola-pizzeria-default-rtdb.europe-west1.firebasedatabase.app"
};

// Inizializza Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Usa l'istanza esistente di Firebase
}

export const database = firebase.database(); // Esporta il database
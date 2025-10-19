// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyCy_Qd8bmI74EmYPe_zo00bUNcLj-a-Ds4",
  authDomain: "spck-2cabb.firebaseapp.com",
  projectId: "spck-2cabb",
  storageBucket: "spck-2cabb.firebasestorage.app",
  messagingSenderId: "385205271821",
  appId: "1:385205271821:web:649e3ae3938bd734048444",
  measurementId: "G-4NT9KBBFV3"
};

  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
  // Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export {auth,db}
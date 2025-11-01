import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

const firebaseConfig = {
apiKey: "AIzaSyCy_Qd8bmI74EmYPe_zo00bUNcLj-a-Ds4",
  authDomain: "spck-2cabb.firebaseapp.com",
  projectId: "spck-2cabb",
  storageBucket: "spck-2cabb.firebasestorage.app",
  messagingSenderId: "385205271821",
  appId: "1:385205271821:web:649e3ae3938bd734048444",
  measurementId: "G-4NT9KBBFV3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export {
  app,
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
};

import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAy8jEAjHn8hEfGGzs6_vBSqf48MNkyigg",
  authDomain: "thespyfall.firebaseapp.com",
  projectId: "thespyfall",
  storageBucket: "thespyfall.appspot.com",
  messagingSenderId: "432278601123",
  appId: "1:432278601123:web:777790a9ad2d7a971c6e16",
  measurementId: "G-9L6XWMQ19D",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQUibVFr6heUG14bhF62jBPl4wVZDrNrE",
  authDomain: "cloud-recipe-coursework.firebaseapp.com",
  projectId: "cloud-recipe-coursework",
  storageBucket: "cloud-recipe-coursework.firebasestorage.app",
  messagingSenderId: "18883135010",
  appId: "1:18883135010:web:2110ccd9c65b07a7b76c7b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;
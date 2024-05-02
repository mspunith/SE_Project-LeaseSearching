// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
	apiKey: "AIzaSyC1UZBeNdzdgowHVzzUCsrgHMPN6M55wh4",
	authDomain: "easylease-8876b.firebaseapp.com",
	projectId: "easylease-8876b",
	storageBucket: "easylease-8876b.appspot.com",
	messagingSenderId: "766234500791",
	appId: "1:766234500791:web:36102e049e33f239977732",
	measurementId: "G-8MC3X2YZC4"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore();

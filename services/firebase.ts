import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCfn0lnYTgKwlqjkZ_iQ51aA6ucgKQNlwk",
  authDomain: "fbtm-bd6f5.firebaseapp.com",
  projectId: "fbtm-bd6f5",
  storageBucket: "fbtm-bd6f5.firebasestorage.app",
  messagingSenderId: "433807952360",
  appId: "1:433807952360:web:7e63cf05c328668522bc5d",
  measurementId: "G-9DMQTZN5KH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
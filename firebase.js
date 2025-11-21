import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyCkfMDxnlKwN2efmhrAGGcqscVuWH6oD3s",
  authDomain: "sure-success-wala.firebaseapp.com",
  projectId: "sure-success-wala",
  storageBucket: "sure-success-wala.firebasestorage.app",
  messagingSenderId: "957142245792",
  appId: "1:957142245792:web:bdfb68c398489a44e8c4c5",
  measurementId: "G-BXMFNJ21QP"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
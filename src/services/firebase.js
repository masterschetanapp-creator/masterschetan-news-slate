import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDs39R9ZEJpAxhFy7BBHSrOlhf_0Lt0zeQ",
  authDomain: "masterchetan-financial.firebaseapp.com",
  projectId: "masterchetan-financial",
  storageBucket: "masterchetan-financial.firebasestorage.app",
  messagingSenderId: "724362311345",
  appId: "1:724362311345:web:73c8a304acc0ae88191490"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;

// editor-app/src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// ✅ Firebase конфиг из .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Можно убрать в проде
console.log("FIREBASE CONFIG:", firebaseConfig);

// ✅ Инициализация
const app = initializeApp(firebaseConfig);

// 🔐 Auth + persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.error("❌ Firebase persistence error:", err)
);

// 📦 Firestore
const db = getFirestore(app);

// 🗂️ Storage
const storage = getStorage(app);

// ✅ Экспорт
export { db, storage, app, auth };

// 🔍 DEBUG (доступ к auth через DevTools)
if (typeof window !== "undefined") {
  // @ts-expect-error отладочная переменная
  window.__firebase = { auth };
}
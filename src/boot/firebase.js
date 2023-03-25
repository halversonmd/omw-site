import { initializeApp } from "firebase/app";
import {
    getDatabase,
    ref as dbRef,
    onChildAdded,
    onValue,
    child,
    get,
    onChildChanged,
    update,
} from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_ID,
    appId: process.env.FB_APP_ID,
    databaseURL: process.env.FB_DB_URL,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);
const auth = getAuth();

export default async () => {
    await signInAnonymously(auth).catch((err) =>
        console.error("signin error: ", err)
    );
};

export { db, dbRef, onChildAdded, onValue, child, get, onChildChanged, update };

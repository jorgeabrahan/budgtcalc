import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js";
import { getFirestore, collection, getDoc, getDocs, setDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";
import { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCDubQuiWtaS8v_OqZp1zuKl4mrNB5JoAo",
    authDomain: "budgtcalc.firebaseapp.com",
    projectId: "budgtcalc",
    storageBucket: "budgtcalc.appspot.com",
    messagingSenderId: "636024261432",
    appId: "1:636024261432:web:79993d1195cd359f160fcd"
};
const fbApp = initializeApp(firebaseConfig);
const fbAuth = getAuth();
const fbStorage = getStorage(fbApp);
const fbDB = getFirestore(fbApp);

export { fbApp, fbAuth, fbDB, fbStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject, collection, getDocs, getDoc, setDoc, doc, deleteDoc, signInWithEmailAndPassword };
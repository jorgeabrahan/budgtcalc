import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.3/firebase-app.js";
import * as authFuncs from "https://www.gstatic.com/firebasejs/9.8.3/firebase-auth.js";
import * as firestoreFuncs from "https://www.gstatic.com/firebasejs/9.8.3/firebase-firestore.js";
import * as storageFuncs from "https://www.gstatic.com/firebasejs/9.8.3/firebase-storage.js";

const FBCONFIG = {
    apiKey: "AIzaSyCDubQuiWtaS8v_OqZp1zuKl4mrNB5JoAo",
    authDomain: "budgtcalc.firebaseapp.com",
    projectId: "budgtcalc",
    storageBucket: "budgtcalc.appspot.com",
    messagingSenderId: "636024261432",
    appId: "1:636024261432:web:79993d1195cd359f160fcd",
};
const FBAPP = initializeApp(FBCONFIG);
const FBAUTH = authFuncs.getAuth();
const FBSTORAGE = storageFuncs.getStorage(FBAPP);
const FBDB = firestoreFuncs.getFirestore(FBAPP);

export { FBAUTH, FBDB, FBSTORAGE, storageFuncs, firestoreFuncs, authFuncs };

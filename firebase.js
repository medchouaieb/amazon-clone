import firebase  from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyAy5m6Acwh0Aj4HjYfA5xggl4RsJ3SCyv4",
    authDomain: "clone-b5dab.firebaseapp.com",
    projectId: "clone-b5dab",
    storageBucket: "clone-b5dab.appspot.com",
    messagingSenderId: "852205737108",
    appId: "1:852205737108:web:788acedc854a5d6a189081"
  };
  
const app = !firebase.apps.length
? firebase.initializeApp(firebaseConfig)
: firebase.app();

export const db = app.firestore();

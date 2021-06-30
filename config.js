import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
  apiKey: "AIzaSyAYDhlLUpxwHNVJPPL9tf3-nY3sizDSaV8",
  authDomain: "wily-63442.firebaseapp.com",
  projectId: "wily-63442",
  storageBucket: "wily-63442.appspot.com",
  messagingSenderId: "68128076164",
  appId: "1:68128076164:web:15d6a525a1db992e5eedd1"
};
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

      export default firebase.firestore();
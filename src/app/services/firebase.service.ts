import { Injectable } from '@angular/core';
import firebase from "firebase/app";
import * as firebaseui from "firebaseui";
import { config } from '../config';
firebase.initializeApp(config);
import 'firebase/database'
import 'firebase/auth'

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  currentUser;
  auth = firebase.auth();

  constructor() {
    const user = sessionStorage.getItem('username')
    if (user) {
      this.currentUser = user
    }
  }

  signoutUser() {
    this.auth.signOut();
    this.currentUser = undefined;
    if (sessionStorage.getItem('username')) {
      sessionStorage.removeItem('username')
    }
  }

  getRef(path) {
    return firebase.database().ref(path);
  }

  instantiateUi(htmlId) {
    const ui = new firebaseui.auth.AuthUI(this.auth);
    ui.start(htmlId, {
      callbacks: {
        signInSuccessWithAuthResult: (authResult) => {
          // Save username in storage
          sessionStorage.setItem('username', authResult.user.displayName);
          return true;
        },
        uiShown: () => {
          // The widget is rendered, hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'popup',
      signInSuccessUrl: 'feed',
      signInOptions: [
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          customParameters: {
            prompt: 'select_account' // Forces account selection even when only one account is available.
          }
        },
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    });
  }

}

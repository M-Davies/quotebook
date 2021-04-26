import { Component, OnInit } from '@angular/core';
import firebase from "firebase/app";
import * as firebaseui from "firebaseui"
import 'firebase/database';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  constructor() {
    // If user logged in, redirect to feed
    if (sessionStorage.getItem('username')) {
      window.location.href = "/feed"
    }
  }

  ngOnInit(): void {
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', {
      callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // Save token
          sessionStorage.setItem("username", authResult.user.displayName);
          return true;
        },
        uiShown: function() {
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

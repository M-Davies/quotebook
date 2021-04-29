import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../services/firebase.service'

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  constructor(private fbService: FirebaseService) {
    // If user logged in, redirect to feed
    if (sessionStorage.getItem('username')) {
      window.location.href = "/feed"
    }
  }

  ngOnInit(): void {
    this.fbService.intantiateUi('#firebaseui-auth-container');
  }

}

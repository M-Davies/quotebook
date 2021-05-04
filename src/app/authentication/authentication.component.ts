import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent {

  constructor (private fbService: FirebaseService) {
    // If user logged in, redirect to feed
    if (fbService.currentUser) {
      window.location.href = "/feed";
    } else {
      this.fbService.instantiateUi();
    }
  }
}

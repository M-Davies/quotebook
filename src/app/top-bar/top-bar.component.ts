import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {
  username = this.fbService.currentUser;

  constructor (private fbService: FirebaseService) {}

  logoutClick() {
    this.fbService.signoutUser();
    window.location.href = "/";
  }
}

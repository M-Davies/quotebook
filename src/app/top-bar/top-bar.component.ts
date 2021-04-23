import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  username;

  constructor () {
  }

  ngOnInit() {
    const potentialUser = sessionStorage.getItem("username")
    if (potentialUser) {
      this.username = potentialUser
    }
  }

  logoutClick() {
    firebase.auth().signOut()
    sessionStorage.removeItem("username")
    window.location.href = "/"
  }
}

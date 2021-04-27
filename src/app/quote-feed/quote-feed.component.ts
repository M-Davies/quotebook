import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent {
  quotes = {};

  constructor() {
    // If user logged out, redirect to auth
    if (!sessionStorage.getItem('username')) {
      window.location.href = "/"
    } else {
      // Collect quotes from db
      firebase.database().ref('quotes/').on('value', (snapshot) => {
        const savedQuotes = snapshot.val();
        this.quotes = savedQuotes
        // Uncomment this if you wish to iterate over the author and quotes
        /*
        for (const [author, quotes] of Object.entries(savedQuotes)) {
          console.log(author);
          console.log(quotes);
        } */
      });
    }
  }

  saveClick() {
    // Get contents of quote and author
    const quote = (<HTMLInputElement> document.getElementById("quote_enter")).value;
    if (!quote) {
      alert("Please enter a quote to save");
      return window.location.reload();
    }
    let author = (<HTMLInputElement> document.getElementById("author_enter")).value;
    if (!author) {
      author = "Anonymous";
    }

    // Save quote & author to firebase
    try {
      let authorRef = firebase.database().ref('quotes/' + author);
      authorRef.push({
        quote: quote,
        timestamp: (new Date).getTime()
      })
    } catch (err) {
      alert("Failed to upload quote, please try again later")
      return window.location.reload();
    }

    // Assume quote was successfully uploaded, refresh so it appears
    return window.location.reload();
  }

  clearClick() {
    // Clear all input groups (have to cast as value doesn't exist otherwise)
    (<HTMLInputElement> document.getElementById("quote_enter")).value = '';
    (<HTMLInputElement> document.getElementById("author_enter")).value = '';
    (<HTMLInputElement> document.getElementById("search_enter")).value = '';
  }

}

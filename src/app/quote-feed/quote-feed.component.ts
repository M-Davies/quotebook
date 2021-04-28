import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent {
  quotes = {};
  currentUser = sessionStorage.getItem('username');

  constructor() {
    // If user logged out, redirect to auth
    if (!this.currentUser) {
      window.location.href = "/"
    } else {
      // Collect quotes from db
      firebase.database().ref(this.currentUser + "quote").on('value', (snapshot) => {
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

  timestampToDate(timestamp) {
    return new Date(timestamp).toUTCString()
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
      // Get author quotes if there are any
      let authorQuotes = [];
      const authorRef = firebase.database().ref(this.currentUser + "quotes" + author)
      authorRef.get().then((snapshot) => {
        // No need for an else as it might be the first time an author has been added
        if (snapshot.exists()) {
          authorQuotes = Array.from(snapshot.val());
        }
      }).catch((error) => {
        console.error(error);
        alert("Could not get author quotes");
        return window.location.reload();
      });

      // Append new quote
      authorQuotes.push({quote: quote, timestamp: (new Date).getTime().toString()})

      // Sort author quotes in chronological order
      const sortedQuotes = authorQuotes.sort(function compare(quoteObjA, quoteObjB) {
        const timestampOfA = parseInt(quoteObjA['timestamp']);
        const timestampOfB = parseInt(quoteObjB['timestamp']);
        if (timestampOfA < timestampOfB) {
          return -1;
        } else if (timestampOfA > timestampOfB) {
          return 1;
        } else {
          // Two timestamps are equal, doesn't matter which goes first
          return 0;
        }
      });

      // Push updated quotes to firebase
      authorRef.set(sortedQuotes);
    } catch (err) {
      console.error(err)
      alert("Failed to upload quote, please try again later")
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

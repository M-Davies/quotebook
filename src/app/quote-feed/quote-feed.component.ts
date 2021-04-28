import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent {
  quotes;
  currentUser = sessionStorage.getItem('username');

  constructor() {
    // If user logged out, redirect to auth
    if (!this.currentUser) {
      window.location.href = "/"
    } else {
      // Collect quotes from db
      firebase.database().ref(`${this.currentUser}/quotes`).on('value', (snapshot) => {
        this.quotes = snapshot.val();

        // Sort author quotes by timestamp
        for (const [author, quotes] of Object.entries(this.quotes)) {
          if (Object.keys(quotes).length > 1) {
            let tempQuotes = [];
            for (const quoteObj of Object.values(quotes)) {
              tempQuotes.push(quoteObj)
            }

            const sortedQuotes = tempQuotes.sort(function compare(firstEl, secondEl) {
              const timestampA = parseInt(firstEl.timestamp);
              const timestampB = parseInt(secondEl.timestamp);
              if ( timestampA > timestampB ){
                return -1;
              } else if ( timestampA < timestampB ){
                return 1;
              } else {
                return 0;
              }
            });

            this.quotes[author] = sortedQuotes
          }
        }
      });
    }
  }

  timestampToDate(timestamp) {
    return new Date(parseInt(timestamp)).toUTCString()
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
      // Get author quotes if there are any & sort
      const authorRef = firebase.database().ref(`${this.currentUser}/quotes/${author}`)
      authorRef.get().then((snapshot) => {
        // No need for an else as it might be the first time an author has been added
        if (snapshot.exists()) {
          console.log("Snapshot from quote save")
          console.log(snapshot.val())
        }
      }).catch((error) => {
        console.error(error);
        alert("Could not get author quotes");
        return window.location.reload();
      });

      // Append new quote
      authorRef.push({quote: quote, timestamp: (new Date).getTime().toString(), htmlId: `id${Math.floor(Math.random() * 1000000000).toString()}`})
    } catch (err) {
      console.error(err)
      alert("Failed to upload quote, please try again later")
    }

    // Assume quote was successfully uploaded, clear contents of quoteboxes
    this.clearClick()
  }

  clearClick() {
    // Clear all input groups (have to cast as value doesn't exist otherwise)
    (<HTMLInputElement> document.getElementById("quote_enter")).value = '';
    (<HTMLInputElement> document.getElementById("author_enter")).value = '';
    (<HTMLInputElement> document.getElementById("search_enter")).value = '';
  }

}

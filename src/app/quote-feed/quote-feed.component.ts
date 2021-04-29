import { Component } from '@angular/core';

import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent {
  quoteArr = [];
  currentUser = sessionStorage.getItem('username');

  constructor(private fbService: FirebaseService) {
    // If user logged out, redirect to auth
    if (!this.currentUser) {
      window.location.href = "/";
    } else {
      // Collect quotes from db
      const quotesRef = this.fbService.getRef(`${this.currentUser}/quotes`).orderByChild('timestamp');
      quotesRef.on('value', (snapshot) => {
        const quotes = snapshot.val();
        if (quotes) {
          // Reverse the quote list as it's in ascending order
          for (const [quoteId, quoteObj] of Object.entries(quotes)) {
            let newQuote = quoteObj;
            newQuote[quoteId] = quoteObj;
            this.quoteArr.push(newQuote);
          }

          const sortedQuotes = this.quoteArr.sort(function compare(firstEl, secondEl) {
            const timestampA = parseInt(firstEl['timestamp']);
            const timestampB = parseInt(secondEl['timestamp']);
            if ( timestampA > timestampB ){
              return -1;
            } else if ( timestampA < timestampB ){
              return 1;
            } else {
              return 0;
            }
          });

          this.quoteArr = sortedQuotes;
        }
      });
    }
  }

  timestampToDate(timestamp) {
    return new Date(parseInt(timestamp)).toUTCString();
  }

  saveClick() {
    // Get contents of quote and author
    const quote = (<HTMLInputElement> document.getElementById("quote_enter")).value;
    if (!quote) {
      alert("Please enter a quote to save");
      return;
    }
    let author = (<HTMLInputElement> document.getElementById("author_enter")).value;
    if (!author) {
      author = "Anonymous";
    }

    // Save quote & author to firebase
    try {
      // Get author quotes if there are any & sort
      const quotesRef = this.fbService.getRef(`${this.currentUser}/quotes`);
      quotesRef.get().catch((error) => {
        console.error(error);
        alert("Could not get author quotes");
        return window.location.reload();
      });

      // Append new quote
      quotesRef.push({
        author: author,
        quote: quote,
        timestamp: (new Date).getTime().toString(),
        htmlId: `id${Math.floor(Math.random() * 1000000000).toString()}`
      });
    } catch (err) {
      console.error(err);
      alert("Failed to upload quote, please try again later");
    }

    // Assume quote was successfully uploaded, clear contents of quoteboxes
    this.clearClick();
    return window.location.reload();
  }

  clearClick() {
    // Clear all input groups (have to cast as value doesn't exist otherwise)
    (<HTMLInputElement> document.getElementById("quote_enter")).value = '';
    (<HTMLInputElement> document.getElementById("author_enter")).value = '';
    (<HTMLInputElement> document.getElementById("search_enter")).value = '';
  }

}

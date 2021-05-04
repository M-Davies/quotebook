import { Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent {
  quoteArr = [];
  username = this.fbService.currentUser;
  loading = true;
  quoteExists = false;

  /* eslint-disable no-unused-vars */
  constructor(private fbService: FirebaseService) {
    // If user logged out, redirect to auth
    if (!this.username) {
      this.loading = false;
      window.location.href = "/";
    } else {
      // Collect quotes from db
      this.gatherQuotes();
    }
  }

  isQuoteInArr(quote): boolean {
    // Checks if the quote already exists in the array, returning true if that's the case, false otherwise
    let inArr = false;
    if (this.quoteArr) {
      for (const quoteObj of this.quoteArr) {
        // There is a bug with this in that if there two identical quotes by the same author then it will not view the old one
        if (quoteObj['quote'].includes(quote)) {
          inArr = true;
          break;
        }
      }
    }
    return inArr;
  }

  async gatherQuotes() {
    const quotesRef = this.fbService.getRef(`${this.username}/quotes`).orderByChild('timestamp');
    await quotesRef.on('value', (snapshot) => {
      const quotes = snapshot.val();
      if (quotes) {
        // Order the list by highest timestamp first & eliminate duplicate values
        for (const [quoteId, quoteObj] of Object.entries(quotes)) {
          if (!this.isQuoteInArr(quoteObj["quote"])) {
            this.quoteArr.push(quoteObj);
          }
        }

        const sortedQuotes = this.quoteArr.sort(function compare(firstEl, secondEl) {
          const timestampA = parseInt(firstEl['timestamp']);
          const timestampB = parseInt(secondEl['timestamp']);
          if (timestampA > timestampB){
            return -1;
          } else if (timestampA < timestampB){
            return 1;
          } else {
            return 0;
          }
        });

        this.quoteArr = sortedQuotes;
        this.loading = false;
      } else {
        // No quotes for this user
        this.loading = false;
      }
    });
  }

  async filterQuotes() {
    // Reset quotes
    await this.gatherQuotes();
    const oldQuotes = this.quoteArr;

    // Get content of search field
    const searchParam = (<HTMLInputElement> document.getElementById("search_enter")).value.toLowerCase();

    if (searchParam !== "") {
      // Overwrite existing accordion items that have a similar author or quote
      const newQuotes = oldQuotes.filter(quoteObj => {
        if (quoteObj.author.trim().toLowerCase().includes(searchParam) || quoteObj.quote.trim().toLowerCase().includes(searchParam)) {
          return true;
        } else {
          return false;
        }
      });
      this.quoteArr = newQuotes;
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

    // Verify quote does not already exist for this author
    this.quoteArr.forEach(quoteObj => {
      if (quoteObj.author.trim().toLowerCase() === author.trim().toLowerCase() && quoteObj.quote.trim().toLowerCase() === quote.trim().toLowerCase()) {
        alert("Quote already exists for this author");
        this.quoteExists = true;
        return;
      }
    });

    // Have to return again if quote exists as well can't pass the return up the blocks
    if (this.quoteExists === true) {
      return;
    }

    // Save quote & author to firebase
    try {
      // Get author quotes if there are any & sort
      const quotesRef = this.fbService.getRef(`${this.username}/quotes`);
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
      return window.location.reload();
    }

    // Assume quote was successfully uploaded, clear contents of input boxes
    this.clearClick();
  }

  clearClick() {
    // Clear all input groups (have to cast as value doesn't exist otherwise)
    (<HTMLInputElement> document.getElementById("quote_enter")).value = '';
    (<HTMLInputElement> document.getElementById("author_enter")).value = '';
    (<HTMLInputElement> document.getElementById("search_enter")).value = '';
  }

}

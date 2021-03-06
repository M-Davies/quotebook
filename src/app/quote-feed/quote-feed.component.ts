import { AfterViewChecked, Component } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-quote-feed',
  templateUrl: './quote-feed.component.html',
  styleUrls: ['./quote-feed.component.css']
})
export class QuoteFeedComponent implements AfterViewChecked {
  quoteArr = [];
  randomQuote = {};
  username = this.fbService.currentUser;
  loading = true;
  quoteExists = false;
  shownRndQuote = false;

  /* eslint-disable no-unused-vars */
  constructor(private fbService: FirebaseService) {
    // If user logged out, redirect to auth
    if (!this.username) {
      this.loading = false;
      window.location.href = "/";
    } else {
      // Generate random quote
      this.generateRandomQuote();

      // Collect user quotes from db
      this.gatherQuotes();
    }
  }

  ngAfterViewChecked() {
    if (this.loading === false && this.shownRndQuote === false) {
      document.getElementById('show_random_quote').click();
      this.shownRndQuote = true;
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

  async generateRandomQuote() {
    return await fetch('https://type.fit/api/quotes')
      .then(data => {
        return data.json();
      })
      .then(quotes => {
        const randomQuoteArr = Array.from(quotes);

        // Convert random quote from arr to JSON then convert to obj
        this.randomQuote = JSON.parse(JSON.stringify(randomQuoteArr[Math.floor(Math.random() * randomQuoteArr.length - 1)]));
      })
      .catch(function (error) {
        alert("Failed to retrieve a random quote of the day, please try again later");
        window.location.reload();
      });
  }

  async gatherQuotes() {
    const quotesRef = this.fbService.getRef(`${this.username}/quotes`).orderByChild('timestamp');
    await quotesRef.on('value', (snapshot) => {
      const quotes = snapshot.val();
      if (quotes) {
        // Order the list by highest timestamp first & eliminate duplicate values
        for (const [quoteId, quoteObj] of Object.entries(quotes)) {
          if (!this.isQuoteInArr(quoteObj["quote"])) {
            quoteObj['id'] = quoteId;
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
    const timestampDate = new Date(parseInt(timestamp));
    let hours, minutes;
    if (timestampDate.getHours() < 10) {
      hours = `0${timestampDate.getHours()}`;
    } else {
      hours = timestampDate.getHours();
    }

    if (timestampDate.getMinutes() < 10) {
      minutes = `0${timestampDate.getMinutes()}`;
    } else {
      minutes = timestampDate.getMinutes();
    }

    return `${timestampDate.getDate()}/${timestampDate.getMonth()}/${timestampDate.getFullYear()} ${hours}:${minutes}`;
  }

  copyClick(id, author, quote) {
    // Spawn sandbox area to craft copy text
    const sandbox = document.createElement("textarea");

    // Place in the top-left corner of screen regardless of scroll position.
    sandbox.style.position = 'fixed';

    // Ensure it has a small width and height. Setting to 1px / 1em doesn't work as this gives a negative w/h on some browsers.
    sandbox.style.width = '2em';
    sandbox.style.height = '2em';

    // Clean up any borders.
    sandbox.style.border = 'none';
    sandbox.style.outline = 'none';
    sandbox.style.boxShadow = 'none';

    // Avoid flash of the white box if rendered for any reason.
    sandbox.style.background = 'transparent';

    // Construct clipboard format and target for copying
    sandbox.value = `${quote.replace(/(\r\n|\n|\r)/gm, "").trim()}\n(${author.replace(/(\r\n|\n|\r)/gm, "").trim()})`;
    document.body.appendChild(sandbox);
    sandbox.focus();
    sandbox.select();

    // Try to copy and display tooltip response
    const tooltip = document.getElementById(id);
    try {
      document.execCommand('copy');
      tooltip.style.color = 'green';
      tooltip.style.zIndex = "10000000000000";
      tooltip.innerHTML = "Copied!";
    } catch (err) {
      tooltip.style.color = 'red';
      tooltip.innerHTML = "Failed to copy to clipboard!";
    }

    // Remove sandbox textarea element after all is done
    document.body.removeChild(sandbox);
  }

  mouseOut(id) {
    document.getElementById(id).innerHTML = "";
  }

  saveClick(authorEle: string, quoteEle: string, content: boolean) {
    // Get contents of quote and author
    let quote: string, author: string;

    if (content === true) {
      quote = quoteEle;
      author = authorEle;
    } else {
      quote = (<HTMLInputElement> document.getElementById(quoteEle)).value;
      author = (<HTMLInputElement> document.getElementById(authorEle)).value;
    }

    if (!quote) {
      alert("Please enter a quote to save");
      return;
    }

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
        alert("Could not get your quotes from database! Please try again later");
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
      alert("Failed to upload quote, please try again later");
      return window.location.reload();
    }

    // Assume quote was successfully uploaded, clear contents of input boxes
    if (content === true) {
      document.getElementById('random_quote_close').click();
    } else {
      this.clearClick();
    }
  }

  clearClick() {
    // Clear all input groups (have to cast as value doesn't exist otherwise)
    (<HTMLInputElement> document.getElementById("quote_enter")).value = '';
    (<HTMLInputElement> document.getElementById("author_enter")).value = '';
  }

}

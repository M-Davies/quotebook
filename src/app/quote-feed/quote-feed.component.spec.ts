/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { QuoteFeedComponent } from './quote-feed.component';
import { FirebaseService } from '../services/firebase.service';

describe('QuoteFeedComponent_Logged_In', () => {
  let component: QuoteFeedComponent;
  let fixture: ComponentFixture<QuoteFeedComponent>;
  let service: FirebaseService;
  let compiled;
  const TEST_USERNAME = 'testusername';
  const TEST_QUOTES = [
    {
      author: "Anonymous",
      htmlId: "id558091592",
      quote: "This is a test anon quote",
      timestamp: "1619987133185",
      id: ""
    },
    {
      author: "Test Author",
      htmlId: "id229603787",
      quote: "This is a test labelled quote",
      timestamp: "1619987151265",
      id: ""
    },
    {
      author: "Test Multiple Author",
      htmlId: "id501804608",
      quote: "This is the first test labelled quote",
      timestamp: "1619987202597",
      id: ""
    },
    {
      author: "Test Multiple Author",
      htmlId: "id690004058",
      quote: "This is the second test labelled quote",
      timestamp: "1619987229222",
      id: ""
    }
  ];

  async function resetFirebaseDb() {
    const quotesRef = await service.getRef(`${TEST_USERNAME}/quotes`);
    await quotesRef.remove().then(async () => {
      TEST_QUOTES.forEach(async function (quote) {
        const fullPath = await quotesRef.push();
        const dbId = fullPath.toString().split("/").pop();
        quote.id = dbId;
        await quotesRef.child(dbId).set(quote);
      });
    });
  }

  beforeEach(async () => {
    sessionStorage.setItem('username', TEST_USERNAME);
    await TestBed.configureTestingModule({
      declarations: [ QuoteFeedComponent ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    service = await TestBed.inject(FirebaseService);
    await resetFirebaseDb();
    fixture = await TestBed.createComponent(QuoteFeedComponent);
    component = fixture.componentInstance;
    await component.gatherQuotes();
    fixture.detectChanges();
  });

  it('should create on user logged in', () => {
    expect(component).toBeTruthy();
    expect(component.username).toBeTruthy();
  });

  it('should render quote input component', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#quote_enter')).toBeTruthy();
  });

  it('should render author input component', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#author_enter')).toBeTruthy();
  });

  it('should render clear input button', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#clear_button')).toBeTruthy();
  });

  it('should clear input of all input fields on clear button click', () => {
    compiled = fixture.nativeElement;
    compiled.querySelector('#quote_enter').value = "test quote";
    compiled.querySelector('#author_enter').value = "test author";
    compiled.querySelector('#clear_button').click();
    expect(compiled.querySelector('#quote_enter').value).toBeFalsy();
    expect(compiled.querySelector('#author_enter').value).toBeFalsy();
  });

  it('should render save input button', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#save_button')).toBeTruthy();
  });

  it('should create alert on empty quote field on save button click', () => {
    compiled = fixture.nativeElement;
    compiled.querySelector('#author_enter').value = "testing if author is created";
    const alertSpy = spyOn(window, 'alert');
    compiled.querySelector('#save_button').click();
    expect(alertSpy).toHaveBeenCalled();
  });

  it('should render search input component', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#search_enter')).toBeTruthy();
  });

  it('should render quote accordion component', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#quote_accordion')).toBeTruthy();
  });

  it('should create same number of accordion quotes of the same length as the test quotes', () => {
    compiled = fixture.nativeElement;
    const quoteItems = compiled.getElementsByClassName('accordion-item');
    expect(quoteItems.length).toEqual(TEST_QUOTES.length);
  });

  it('should contain accordion quote that has the same author and message as one of the declared test quotes', () => {
    compiled = fixture.nativeElement;
    let quoteHeaders = [];
    compiled.querySelectorAll('.accordion-header').forEach(headerEle => {
      quoteHeaders.push(headerEle.textContent);
    });
    let quoteContent = [];
    compiled.querySelectorAll('.accordion-body').forEach(quoteEle => {
      quoteContent.push(quoteEle.textContent.split("\"")[1]);
    });


    TEST_QUOTES.forEach(function (quoteItem) {
      expect(quoteHeaders.includes(quoteItem.author)).toBeTrue();
      expect(quoteContent.includes(quoteItem.quote)).toBeTrue();
    });
  });

  it('should contain quotes in chronological order', () => {
      let previousTimestamp = 0;
      for (const quote of Object.values(component.quoteArr)) {
        if (previousTimestamp !== 0) {
          expect(parseInt(quote.timestamp)).toBeLessThanOrEqual(previousTimestamp);
        }
        previousTimestamp = parseInt(quote.timestamp);
      }
  });

  it('should filter quotes by the author keyword in search field', async () => {
    compiled = fixture.nativeElement;
    compiled.querySelector('#search_enter').value = "multiple";
    await component.filterQuotes();
    expect(component.quoteArr.length).toEqual(2);
  });

  it('should filter quotes by the quote keyword in search field', async () => {
    compiled = fixture.nativeElement;
    compiled.querySelector('#search_enter').value = "second";
    await component.filterQuotes();
    expect(component.quoteArr.length).toEqual(1);
  });

  it('should copy quote to clipboard in correct format on copy click', () => {
    async function readClipboard() {
      return await navigator.clipboard.readText().then(clipboardContent => { return clipboardContent; });
    }

    compiled = fixture.nativeElement;
    TEST_QUOTES.forEach(async function (quoteItem) {
      spyOn(document, 'execCommand');
      compiled.querySelector(`#${quoteItem.id}`).click();
      const clipboardContent = await readClipboard();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(clipboardContent).toEqual(`${quoteItem.quote.replace(/(\r\n|\n|\r)/gm, "").trim()}\n(${quoteItem.author.replace(/(\r\n|\n|\r)/gm, "").trim()})`);
    });
  });

  it('should generate a random quote on page load', async () => {
    compiled = fixture.nativeElement;
    await component.generateRandomQuote();
    expect(Object.keys(component.randomQuote).length).toEqual(2);
    expect(component.randomQuote['author']).toBeTruthy();
    expect(component.randomQuote['text']).toBeTruthy();
  });

  it('should save the random quote to user quotes on save click', async () => {
    compiled = fixture.nativeElement;
    const oldQuoteLen = component.quoteArr.length;
    await component.generateRandomQuote();
    compiled.querySelector('#save_random_quote').click();
    await component.gatherQuotes();
    const newQuoteLen = component.quoteArr.length;
    expect(newQuoteLen).toBeGreaterThan(oldQuoteLen);
  });

  afterEach(async () => {
    sessionStorage.removeItem('username');
  });
});

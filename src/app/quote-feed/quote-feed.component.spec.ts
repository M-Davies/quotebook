/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteFeedComponent } from './quote-feed.component';
import { FirebaseService } from '../services/firebase.service';

describe('QuoteFeedComponent', () => {
  let component: QuoteFeedComponent;
  let fixture: ComponentFixture<QuoteFeedComponent>;

  const TEST_USERNAME = 'testusername';
  const TEST_QUOTES = [
    {
      author: "Anonymous",
      htmlId: "id558091592",
      quote: "This is a test anon quote",
      timestamp: "1619987133185"
    },
    {
      author: "Test Author",
      htmlId: "id229603787",
      quote: "This is a test labelled quote",
      timestamp: "1619987151265"
    },
    {
      author: "Test Multiple Author",
      htmlId: "id501804608",
      quote: "This is the first test labelled quote",
      timestamp: "1619987202597"
    },
    {
      author: "Test Multiple Author",
      htmlId: "id690004058",
      quote: "This is the second test labelled quote",
      timestamp: "1619987229222"
    }
  ];

  async function resetFirebaseDb() {
    const service = TestBed.inject(FirebaseService);
    const ref = await service.getRef(`${TEST_USERNAME}/quotes`);
    ref.set({});
    for (const quote in TEST_QUOTES) {
      ref.push(quote);
    }
  }

  beforeEach(async () => {
    sessionStorage.setItem('username', TEST_USERNAME);
    resetFirebaseDb();
    await TestBed.configureTestingModule({
      declarations: [ QuoteFeedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create on user logged in', () => {
    expect(component).toBeTruthy();
    expect(component.username).toBeTruthy();
  });

  it('should redirect on user logged out', () => {
    sessionStorage.removeItem('username');
    expect(component).toBeFalsy();
    expect(component.username).toBeFalsy();
  });

  it('should render quote input component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#quote_enter')).toBeTruthy();
  });

  it('should render author input component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#author_enter')).toBeTruthy();
  });

  it('should render clear input button', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#clear_button')).toBeTruthy();
  });

  it('should clear input of all input fields on clear button click', () => {
    const compiled = fixture.nativeElement;
    compiled.querySelector('#quote_enter').value = "test quote";
    compiled.querySelector('#author_enter').value = "test author";
    compiled.querySelector('#search_enter').value = "test search";
    compiled.querySelector('#clear_button').click();
    expect(compiled.querySelector('#quote_enter').value).toBeFalsy();
    expect(compiled.querySelector('#author_enter').value).toBeFalsy();
    expect(compiled.querySelector('#search_enter').value).toBeFalsy();
  });

  it('should render save input button', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#save_button')).toBeTruthy();
  });

  it('should create alert on empty quote field on save button click', () => {
    const compiled = fixture.nativeElement;
    compiled.querySelector('#author_enter').value = "testing if author is created";
    spyOn(compiled, 'alert');
    compiled.querySelector('#save_button').click();
    expect(compiled.alert).toHaveBeenCalledWith('Please enter a quote to save');
  });

  it('should render search input component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#search_enter')).toBeTruthy();
  });

  it('should render quote accordion component', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#quote_accordion')).toBeTruthy();
  });

  it('should create same number of accordion quotes of the same length as the test quotes', () => {
    const compiled = fixture.nativeElement;
    const quoteItems = compiled.getElementsByClassName('.accordion-item');
    expect(quoteItems.length).toEqual(TEST_QUOTES.length);
  });

  it('should contain accordion quote that has the same author and message as one of the declared test quotes', () => {
    const compiled = fixture.nativeElement;
    const quoteHeaders = compiled.querySelectorAll('.accordion-header').classList;
    const quoteContent = compiled.querySelectorAll('.accordion-body').classList;
    TEST_QUOTES.forEach(function (quoteItem) {
      expect(quoteHeaders.contains(quoteItem.author)).toBeTrue();
      expect(quoteContent.contains(quoteItem.quote)).toBeTrue();
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

  it('should filter quotes by the author keyword in search field', () => {
    const compiled = fixture.nativeElement;
    compiled.querySelector('#search_enter').value = "multiple";
    expect(component.quoteArr.length).toEqual(2);
  });

  it('should filter quotes by the quote keyword in search field', () => {
    const compiled = fixture.nativeElement;
    compiled.querySelector('#search_enter').value = "second";
    expect(component.quoteArr.length).toEqual(1);
  });
});

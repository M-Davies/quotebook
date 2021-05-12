/*eslint-env jasmine*/
import { TestBed } from '@angular/core/testing';

import { FirebaseService } from './firebase.service';

describe('FirebaseService_Logged_In', () => {
  let service: FirebaseService;
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
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseService);
    await resetFirebaseDb();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should assign current user on token presence', () => {
    expect(service.currentUser).toEqual(TEST_USERNAME);
  });

  it('should retrieve database quotes', async () => {
    const ref = service.getRef(`${TEST_USERNAME}/quotes`);
    async function getQuotes() {
      return await ref.on('value', (snapshot) => { return snapshot.val(); });
    }

    const quotes = getQuotes();
    expect(Object.keys(quotes).length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    sessionStorage.removeItem('username');
  });
});

describe('FirebaseService_Logged_Out', () => {
  let service: FirebaseService;

  beforeEach(() => {
    sessionStorage.removeItem('username');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should unassign current user on log out', () => {
    service.signoutUser();
    expect(service.currentUser).toBeFalsy();
    expect(sessionStorage.getItem('username')).toBeFalsy();
  });
});

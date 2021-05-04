/*eslint-env jasmine*/
import { TestBed } from '@angular/core/testing';

import { FirebaseService } from './firebase.service';

describe('FirebaseService', () => {
  const TEST_USERNAME = 'testusername';
  let service: FirebaseService;

  function setLoginToken() {
    sessionStorage.setItem('username', TEST_USERNAME);
  }

  async function getDatabaseContents(path) {
    let contents;
    await service.getRef(path).on('value', (snapshot) => {
      expect(snapshot).toBeTruthy();
      contents = snapshot.val();
    });
    return contents;
  }

  beforeEach(() => {
    sessionStorage.removeItem('username');
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should assign current user on token presence', () => {
    setLoginToken();
    expect(service.currentUser).toEqual(TEST_USERNAME);
  });

  it('should unassign current user on log out', () => {
    setLoginToken();
    service.signoutUser();
    expect(service.currentUser).toBeFalsy();
    expect(sessionStorage.getItem('username')).toBeFalsy();
  });

  it('should retrieve database quotes in chronological order', () => {
    setLoginToken();
    const userQuotes = getDatabaseContents(`${TEST_USERNAME}/quotes`);
    expect(Object.keys(userQuotes).length).toBeGreaterThan(0);

    let previousTimestamp = 0;
    for (const quote of Object.values(userQuotes)) {
      if (previousTimestamp !== 0) {
        expect(parseInt(quote.timestamp)).toBeLessThanOrEqual(previousTimestamp);
      }
      previousTimestamp = parseInt(quote.timestamp);
    }
  });
});

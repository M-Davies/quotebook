/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticationComponent } from './authentication.component';

describe('AuthenticationComponent', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;
  const TEST_USERNAME = 'testusername';

  function setLoginToken() {
    sessionStorage.setItem('username', TEST_USERNAME);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthenticationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    sessionStorage.removeItem('username');
    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect on user logged in', () => {
    setLoginToken();
    expect(component).toBeFalsy();
  });

  it('should render auth ui', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#firebaseui-auth-container')).toBeTruthy();
  });
});

/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AuthenticationComponent } from './authentication.component';
import { FirebaseService } from '../services/firebase.service';

describe('AuthenticationComponent_Logged_Out', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;

  beforeEach(async () => {
    sessionStorage.removeItem('username');
    await TestBed.configureTestingModule({
      declarations: [ AuthenticationComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        {
          provide: FirebaseService,
          useValue: {
             currentUser: "",
             instantiateUi: () => null
          }
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loader on login in loading state', () => {
    expect(fixture.nativeElement.querySelector('#loader')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#loader').hidden).toEqual(false);
  });

  it('should render auth ui on login', () => {
    expect(fixture.nativeElement.querySelector('#firebaseui_auth_container')).toBeTruthy();
  });

});

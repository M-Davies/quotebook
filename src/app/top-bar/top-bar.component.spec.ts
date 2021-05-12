/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirebaseService } from '../services/firebase.service';
import { TopBarComponent } from './top-bar.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TopBarComponent_Logged_In', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  let compiled;
  const TEST_USERNAME = 'testusername';

  beforeEach(async () => {
    sessionStorage.setItem('username', TEST_USERNAME);
    await TestBed.configureTestingModule({
      declarations: [ TopBarComponent ],
      providers: [ FirebaseService ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the top bar', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with `Quotebook` as the contents', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Quotebook');
  });

  it('should render log out button while user is logged in', async () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#logout_button')).toBeTruthy();
  });

  it('should render custom welcome header while user is logged in', async () => {
    sessionStorage.setItem('username', TEST_USERNAME);
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#user_header').textContent).toContain(`Welcome ${TEST_USERNAME}`);
  });

  afterAll(async () => {
    sessionStorage.removeItem('username');
  });

});

describe('TopBarComponent_Logged_Out', () => {
  let fixture: ComponentFixture<TopBarComponent>;
  let compiled;

  beforeEach(async () => {
    sessionStorage.removeItem('username');
    await TestBed.configureTestingModule({
      declarations: [ TopBarComponent ],
      providers: [ FirebaseService ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
    fixture = TestBed.createComponent(TopBarComponent);
    fixture.detectChanges();
  });

  it('should not render custom welcome header button when user is logged out', () => {
    compiled = fixture.nativeElement;
    expect(compiled.querySelector('#user_header')).toBeFalsy();
  });
});

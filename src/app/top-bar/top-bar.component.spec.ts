/*eslint-env jasmine*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TopBarComponent } from './top-bar.component';

describe('AppComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;
  const TEST_USERNAME = 'testusername';

  beforeEach(async () => {
    sessionStorage.removeItem('username');
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        TopBarComponent
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    sessionStorage.removeItem('username');
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function setLoginToken() {
    sessionStorage.setItem('username', TEST_USERNAME);
  }

  it('should create the top bar', () => {
    expect(component).toBeTruthy();
  });

  it('should render header with `Quotebook` as the contents', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Quotebook');
  });

  it('should render log out button while user is logged out', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#logout_button')).toBeTruthy();
  });

  it('should not render log out button while user is logged in', () => {
    setLoginToken();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.button fancy-button')).toBeFalsy();
  });

  it('should render custom welcome header while user is logged in', () => {
    setLoginToken();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#user_header').textContent).toContain(`Welcome ${TEST_USERNAME}`);
  });

  it('should not render custom welcome header button when user is logged out', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('#user_header')).toBeFalsy();
  });
});
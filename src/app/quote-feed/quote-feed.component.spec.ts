import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteFeedComponent } from './quote-feed.component';

describe('QuoteFeedComponent', () => {
  let component: QuoteFeedComponent;
  let fixture: ComponentFixture<QuoteFeedComponent>;

  beforeEach(async () => {
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

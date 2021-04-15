import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCreditComponent } from './app-credit.component';

describe('AppCreditComponent', () => {
  let component: AppCreditComponent;
  let fixture: ComponentFixture<AppCreditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCreditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

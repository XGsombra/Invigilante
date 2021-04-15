import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterexamDialogComponent } from './enterexam-dialog.component';

describe('EnterexamDialogComponent', () => {
  let component: EnterexamDialogComponent;
  let fixture: ComponentFixture<EnterexamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnterexamDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterexamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

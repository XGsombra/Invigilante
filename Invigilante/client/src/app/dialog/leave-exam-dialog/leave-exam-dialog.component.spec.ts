import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveExamDialogComponent } from './leave-exam-dialog.component';

describe('LeaveExamDialogComponent', () => {
  let component: LeaveExamDialogComponent;
  let fixture: ComponentFixture<LeaveExamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveExamDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveExamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewexamDialogComponent } from './newexam-dialog.component';

describe('NewexamDialogComponent', () => {
  let component: NewexamDialogComponent;
  let fixture: ComponentFixture<NewexamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewexamDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewexamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

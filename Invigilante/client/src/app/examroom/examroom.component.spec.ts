import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamroomComponent } from './examroom.component';

describe('ExamroomComponent', () => {
  let component: ExamroomComponent;
  let fixture: ComponentFixture<ExamroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamroomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

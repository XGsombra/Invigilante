import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdDialogComponent } from './id-dialog.component';

describe('IdDialogComponent', () => {
  let component: IdDialogComponent;
  let fixture: ComponentFixture<IdDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

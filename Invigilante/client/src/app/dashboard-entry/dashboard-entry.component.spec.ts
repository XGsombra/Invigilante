import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEntryComponent } from './dashboard-entry.component';

describe('DashboardEntryComponent', () => {
  let component: DashboardEntryComponent;
  let fixture: ComponentFixture<DashboardEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

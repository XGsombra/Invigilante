import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpCheckDialogComponent } from './ip-check-dialog.component';

describe('IpCheckDialogComponent', () => {
  let component: IpCheckDialogComponent;
  let fixture: ComponentFixture<IpCheckDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpCheckDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IpCheckDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

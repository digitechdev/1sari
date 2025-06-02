import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MissedPaymentsPage } from './missed-payments.page';

describe('MissedPaymentsPage', () => {
  let component: MissedPaymentsPage;
  let fixture: ComponentFixture<MissedPaymentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MissedPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

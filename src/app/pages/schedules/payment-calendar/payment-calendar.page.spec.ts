import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentCalendarPage } from './payment-calendar.page';

describe('PaymentCalendarPage', () => {
  let component: PaymentCalendarPage;
  let fixture: ComponentFixture<PaymentCalendarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

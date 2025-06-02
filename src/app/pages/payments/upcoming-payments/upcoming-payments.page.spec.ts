import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingPaymentsPage } from './upcoming-payments.page';

describe('UpcomingPaymentsPage', () => {
  let component: UpcomingPaymentsPage;
  let fixture: ComponentFixture<UpcomingPaymentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingPaymentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

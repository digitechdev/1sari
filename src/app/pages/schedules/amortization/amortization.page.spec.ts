import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmortizationPage } from './amortization.page';

describe('AmortizationPage', () => {
  let component: AmortizationPage;
  let fixture: ComponentFixture<AmortizationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AmortizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

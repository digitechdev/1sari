import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanProductsPage } from './loan-products.page';

describe('LoanProductsPage', () => {
  let component: LoanProductsPage;
  let fixture: ComponentFixture<LoanProductsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

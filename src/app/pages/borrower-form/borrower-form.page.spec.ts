import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BorrowerFormPage } from './borrower-form.page';

describe('BorrowerFormPage', () => {
  let component: BorrowerFormPage;
  let fixture: ComponentFixture<BorrowerFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowerFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

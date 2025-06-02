import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisbursementPage } from './disbursement.page';

describe('DisbursementPage', () => {
  let component: DisbursementPage;
  let fixture: ComponentFixture<DisbursementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DisbursementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

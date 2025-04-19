import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BorrowerDetailPage } from './borrower-detail.page';

describe('BorrowerDetailPage', () => {
  let component: BorrowerDetailPage;
  let fixture: ComponentFixture<BorrowerDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowerDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

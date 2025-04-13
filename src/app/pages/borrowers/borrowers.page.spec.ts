import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BorrowersPage } from './borrowers.page';

describe('BorrowersPage', () => {
  let component: BorrowersPage;
  let fixture: ComponentFixture<BorrowersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

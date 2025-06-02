import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverduePage } from './overdue.page';

describe('OverduePage', () => {
  let component: OverduePage;
  let fixture: ComponentFixture<OverduePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OverduePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

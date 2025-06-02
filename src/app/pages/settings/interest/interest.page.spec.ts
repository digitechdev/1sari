import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InterestPage } from './interest.page';

describe('InterestPage', () => {
  let component: InterestPage;
  let fixture: ComponentFixture<InterestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InterestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

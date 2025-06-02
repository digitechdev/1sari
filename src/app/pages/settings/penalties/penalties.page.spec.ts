import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PenaltiesPage } from './penalties.page';

describe('PenaltiesPage', () => {
  let component: PenaltiesPage;
  let fixture: ComponentFixture<PenaltiesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

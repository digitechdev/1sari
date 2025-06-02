import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DueRemindersPage } from './due-reminders.page';

describe('DueRemindersPage', () => {
  let component: DueRemindersPage;
  let fixture: ComponentFixture<DueRemindersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DueRemindersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

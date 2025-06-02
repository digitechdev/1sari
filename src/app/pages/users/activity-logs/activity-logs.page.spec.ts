import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityLogsPage } from './activity-logs.page';

describe('ActivityLogsPage', () => {
  let component: ActivityLogsPage;
  let fixture: ComponentFixture<ActivityLogsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityLogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

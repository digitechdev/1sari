import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExpensesWidgetComponent } from './expenses-widget.component';

describe('ExpensesWidgetComponent', () => {
  let component: ExpensesWidgetComponent;
  let fixture: ComponentFixture<ExpensesWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExpensesWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

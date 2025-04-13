import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransactionsWidgetComponent } from './transactions-widget.component';

describe('TransactionsWidgetComponent', () => {
  let component: TransactionsWidgetComponent;
  let fixture: ComponentFixture<TransactionsWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TransactionsWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BalanceWidgetComponent } from './balance-widget.component';

describe('BalanceWidgetComponent', () => {
  let component: BalanceWidgetComponent;
  let fixture: ComponentFixture<BalanceWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BalanceWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

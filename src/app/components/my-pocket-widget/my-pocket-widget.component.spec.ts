import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MyPocketWidgetComponent } from './my-pocket-widget.component';

describe('MyPocketWidgetComponent', () => {
  let component: MyPocketWidgetComponent;
  let fixture: ComponentFixture<MyPocketWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MyPocketWidgetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPocketWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

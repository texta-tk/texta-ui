import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateConstraintsComponent } from './date-constraints.component';

describe('DateConstraintsComponent', () => {
  let component: DateConstraintsComponent;
  let fixture: ComponentFixture<DateConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DateConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

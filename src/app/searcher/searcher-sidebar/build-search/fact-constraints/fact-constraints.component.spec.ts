import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactConstraintsComponent } from './fact-constraints.component';

describe('FactConstraintsComponent', () => {
  let component: FactConstraintsComponent;
  let fixture: ComponentFixture<FactConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

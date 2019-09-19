import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactTextConstraintsComponent } from './fact-text-constraints.component';

describe('FactTextConstraintsComponent', () => {
  let component: FactTextConstraintsComponent;
  let fixture: ComponentFixture<FactTextConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactTextConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactTextConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

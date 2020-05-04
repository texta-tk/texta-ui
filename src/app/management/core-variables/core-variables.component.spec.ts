import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreVariablesComponent } from './core-variables.component';

describe('CoreVariablesComponent', () => {
  let component: CoreVariablesComponent;
  let fixture: ComponentFixture<CoreVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoreVariablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoreVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

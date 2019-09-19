import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextConstraintsComponent } from './text-constraints.component';

describe('TextConstraintsComponent', () => {
  let component: TextConstraintsComponent;
  let fixture: ComponentFixture<TextConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

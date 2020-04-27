import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitTextComponent } from './limit-text.component';

describe('LimitTextComponent', () => {
  let component: LimitTextComponent;
  let fixture: ComponentFixture<LimitTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

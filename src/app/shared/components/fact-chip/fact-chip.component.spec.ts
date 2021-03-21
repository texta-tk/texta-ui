import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactChipComponent } from './fact-chip.component';

describe('FactChipComponent', () => {
  let component: FactChipComponent;
  let fixture: ComponentFixture<FactChipComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FactChipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurotagTextDialogComponent } from './neurotag-text-dialog.component';

describe('NeurotagTextDialogComponent', () => {
  let component: NeurotagTextDialogComponent;
  let fixture: ComponentFixture<NeurotagTextDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeurotagTextDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeurotagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

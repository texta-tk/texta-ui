import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurotagRandomDocDialogComponent } from './neurotag-random-doc-dialog.component';

describe('NeurotagRandomDocDialogComponent', () => {
  let component: NeurotagRandomDocDialogComponent;
  let fixture: ComponentFixture<NeurotagRandomDocDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeurotagRandomDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeurotagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

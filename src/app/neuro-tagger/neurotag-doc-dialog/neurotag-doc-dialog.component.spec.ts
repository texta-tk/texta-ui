import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurotagDocDialogComponent } from './neurotag-doc-dialog.component';

describe('NeurotagDocDialogComponent', () => {
  let component: NeurotagDocDialogComponent;
  let fixture: ComponentFixture<NeurotagDocDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeurotagDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeurotagDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

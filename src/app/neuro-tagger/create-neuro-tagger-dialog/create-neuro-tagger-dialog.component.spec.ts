import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNeuroTaggerDialogComponent } from './create-neuro-tagger-dialog.component';

describe('CreateNeuroTaggerDialogComponent', () => {
  let component: CreateNeuroTaggerDialogComponent;
  let fixture: ComponentFixture<CreateNeuroTaggerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateNeuroTaggerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNeuroTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

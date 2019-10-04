import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {NeurotagDocDialogComponent} from './neurotag-doc-dialog.component';
import {SharedModule} from '../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {NeuroTaggerComponent} from '../neuro-tagger/neuro-tagger.component';
import {NeuroTagger} from '../../shared/types/tasks/NeuroTagger';

describe('NeurotagDocDialogComponent', () => {
  let component: NeurotagDocDialogComponent;
  let fixture: ComponentFixture<NeurotagDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const data = {currentProjectId: 0, tagger: new NeuroTagger()};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ NeurotagDocDialogComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }]
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeurotagRandomDocDialogComponent } from './neurotag-random-doc-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {NeuroTagger} from '../../../shared/types/tasks/NeuroTagger';

describe('NeurotagRandomDocDialogComponent', () => {
  let component: NeurotagRandomDocDialogComponent;
  let fixture: ComponentFixture<NeurotagRandomDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const neuroTagger = new NeuroTagger();
  neuroTagger.id = 0;
  const data = {currentProjectId: 0, neurotagger: neuroTagger};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ NeurotagRandomDocDialogComponent ],
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
    fixture = TestBed.createComponent(NeurotagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

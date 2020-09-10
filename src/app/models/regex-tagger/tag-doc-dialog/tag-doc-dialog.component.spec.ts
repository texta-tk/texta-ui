import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDocDialogComponent } from './tag-doc-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('TagDocDialogComponent', () => {
  let component: TagDocDialogComponent;
  let fixture: ComponentFixture<TagDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const tagger = { currentProjectId: 1, tagger: {} };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: tagger
        }
      ],
      declarations: [ TagDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

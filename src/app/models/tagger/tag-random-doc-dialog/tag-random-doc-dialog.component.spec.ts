import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {TagRandomDocDialogComponent} from './tag-random-doc-dialog.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Tagger} from '../../../shared/types/tasks/Tagger';

describe('TagRandomDocDialogComponent', () => {
  let component: TagRandomDocDialogComponent;
  let fixture: ComponentFixture<TagRandomDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, tagger: new Tagger()};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [TagRandomDocDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagDocDialogComponent } from './tag-doc-dialog.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Tagger} from '../../../../shared/types/tasks/Tagger';

describe('TagDocDialogComponent', () => {
  let component: TagDocDialogComponent;
  let fixture: ComponentFixture<TagDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, tagger: new Tagger()};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagDocDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [
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
    fixture = TestBed.createComponent(TagDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

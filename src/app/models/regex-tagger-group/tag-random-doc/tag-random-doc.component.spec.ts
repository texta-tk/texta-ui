import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagRandomDocComponent } from './tag-random-doc.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('TagRandomDocComponent', () => {
  let component: TagRandomDocComponent;
  let fixture: ComponentFixture<TagRandomDocComponent>;

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
      declarations: [ TagRandomDocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagRandomDocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

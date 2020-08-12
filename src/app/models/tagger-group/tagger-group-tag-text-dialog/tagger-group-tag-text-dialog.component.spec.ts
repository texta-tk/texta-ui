import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagTextDialogComponent } from './tagger-group-tag-text-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('TaggerGroupTagTextDialogComponent', () => {
  let component: TaggerGroupTagTextDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagTextDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, tagger: 1};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagTextDialogComponent ],
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
    fixture = TestBed.createComponent(TaggerGroupTagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

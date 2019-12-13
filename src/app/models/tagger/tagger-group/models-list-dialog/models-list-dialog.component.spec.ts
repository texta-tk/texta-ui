import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ModelsListDialogComponent} from './models-list-dialog.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CreateTaggerGroupDialogComponent} from '../create-tagger-group-dialog/create-tagger-group-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';


describe('ModelsListDialogComponent', () => {
  let component: ModelsListDialogComponent;
  let fixture: ComponentFixture<ModelsListDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, tagger: 1};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ModelsListDialogComponent],
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
    fixture = TestBed.createComponent(ModelsListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

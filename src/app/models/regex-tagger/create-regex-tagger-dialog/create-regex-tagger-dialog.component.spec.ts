import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRegexTaggerDialogComponent } from './create-regex-tagger-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';

describe('CreateRegexTaggerDialogComponent', () => {
  let component: CreateRegexTaggerDialogComponent;
  let fixture: ComponentFixture<CreateRegexTaggerDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }
      ],
      declarations: [ CreateRegexTaggerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRegexTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

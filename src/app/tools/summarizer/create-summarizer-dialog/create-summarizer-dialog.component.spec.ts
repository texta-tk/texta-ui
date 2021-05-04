import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSummarizerDialogComponent } from './create-summarizer-dialog.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';

describe('CreateSummarizerDialogComponent', () => {
  let component: CreateSummarizerDialogComponent;
  let fixture: ComponentFixture<CreateSummarizerDialogComponent>;
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
        }],
      declarations: [ CreateSummarizerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSummarizerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

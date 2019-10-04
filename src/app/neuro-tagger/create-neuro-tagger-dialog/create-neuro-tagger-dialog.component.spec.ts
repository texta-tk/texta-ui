import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNeuroTaggerDialogComponent } from './create-neuro-tagger-dialog.component';
import {SharedModule} from '../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatDialogRef} from '@angular/material';

describe('CreateNeuroTaggerDialogComponent', () => {
  let component: CreateNeuroTaggerDialogComponent;
  let fixture: ComponentFixture<CreateNeuroTaggerDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ CreateNeuroTaggerDialogComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNeuroTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

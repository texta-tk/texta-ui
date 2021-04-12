import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEvaluatorDialogComponent } from './create-evaluator-dialog.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';

describe('CreateEvaluatorDialogComponent', () => {
  let component: CreateEvaluatorDialogComponent;
  let fixture: ComponentFixture<CreateEvaluatorDialogComponent>;
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
      declarations: [ CreateEvaluatorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEvaluatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

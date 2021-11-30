import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {CreateAnonymizerDialogComponent} from './create-anonymizer-dialog.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {MLPCreateIndexDialogComponent} from '../../mlp/mlp-create-index-dialog/mlp-create-index-dialog.component';

describe('CreateAnonymizerDialogComponent', () => {
  let component: CreateAnonymizerDialogComponent;
  let fixture: ComponentFixture<CreateAnonymizerDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }],
      declarations: [CreateAnonymizerDialogComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAnonymizerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

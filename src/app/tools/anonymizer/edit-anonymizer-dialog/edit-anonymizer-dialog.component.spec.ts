import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditAnonymizerDialogComponent} from './edit-anonymizer-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

const mockDialogRef = {
  close: jasmine.createSpy('close')
};
const anonymizer = {};
describe('EditAnonymizerDialogComponent', () => {
  let component: EditAnonymizerDialogComponent;
  let fixture: ComponentFixture<EditAnonymizerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EditAnonymizerDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: anonymizer
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAnonymizerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddBertModelDialogComponent} from './add-bert-model-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('AddBertModelDialogComponent', () => {
  let component: AddBertModelDialogComponent;
  let fixture: ComponentFixture<AddBertModelDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }],
      declarations: [AddBertModelDialogComponent]

    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBertModelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

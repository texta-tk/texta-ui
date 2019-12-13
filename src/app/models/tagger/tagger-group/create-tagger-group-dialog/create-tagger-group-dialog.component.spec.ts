import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material';

describe('CreateTaggerGroupDialogComponent', () => {
  let component: CreateTaggerGroupDialogComponent;
  let fixture: ComponentFixture<CreateTaggerGroupDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [CreateTaggerGroupDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaggerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

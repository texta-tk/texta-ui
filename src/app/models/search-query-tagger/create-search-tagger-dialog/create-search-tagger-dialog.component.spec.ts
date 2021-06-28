import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSearchTaggerDialogComponent } from './create-search-tagger-dialog.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';

describe('CreateSearchTaggerDialogComponent', () => {
  let component: CreateSearchTaggerDialogComponent;
  let fixture: ComponentFixture<CreateSearchTaggerDialogComponent>;
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
      declarations: [ CreateSearchTaggerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateSearchTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

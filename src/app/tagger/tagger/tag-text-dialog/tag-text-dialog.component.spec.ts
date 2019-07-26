import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagTextDialogComponent } from './tag-text-dialog.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatDialogRef} from '@angular/material';

describe('TagTextDialogComponent', () => {
  let component: TagTextDialogComponent;
  let fixture: ComponentFixture<TagTextDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagTextDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

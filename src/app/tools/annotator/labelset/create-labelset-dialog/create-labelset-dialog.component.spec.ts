import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateLabelsetDialogComponent} from './create-labelset-dialog.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../../shared/shared-module/shared.module';

describe('CreateLabelsetDialogComponent', () => {
  let component: CreateLabelsetDialogComponent;
  let fixture: ComponentFixture<CreateLabelsetDialogComponent>;
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
      declarations: [CreateLabelsetDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLabelsetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

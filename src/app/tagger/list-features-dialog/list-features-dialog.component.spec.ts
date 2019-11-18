import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFeaturesDialogComponent } from './list-features-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ListFeaturesDialogComponent', () => {
  let component: ListFeaturesDialogComponent;
  let fixture: ComponentFixture<ListFeaturesDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const data = {currentProjectId: 1, taggerId: 2};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFeaturesDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFeaturesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

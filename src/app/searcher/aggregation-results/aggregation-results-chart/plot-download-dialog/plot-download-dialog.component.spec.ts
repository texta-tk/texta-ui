import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PlotDownloadDialogComponent} from './plot-download-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('PlotDownloadDialogComponent', () => {
  let component: PlotDownloadDialogComponent;
  let fixture: ComponentFixture<PlotDownloadDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlotDownloadDialogComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotDownloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

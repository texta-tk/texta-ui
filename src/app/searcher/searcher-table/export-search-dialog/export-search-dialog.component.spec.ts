import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExportSearchDialogComponent} from './export-search-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SearcherComponentService} from "../../services/searcher-component.service";
import {SearchServiceSpy} from "../../services/searcher-component.service.spec";
import {SharedModule} from "../../../shared/shared.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('ExportSearchDialogComponent', () => {
  let component: ExportSearchDialogComponent;
  let fixture: ComponentFixture<ExportSearchDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ExportSearchDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }, [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

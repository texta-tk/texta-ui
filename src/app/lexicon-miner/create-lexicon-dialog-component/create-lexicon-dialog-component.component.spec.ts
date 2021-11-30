import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLexiconDialogComponentComponent } from './create-lexicon-dialog-component.component';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {SharedModule} from "../../shared/shared-module/shared.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('CreateLexiconDialogComponentComponent', () => {
  let component: CreateLexiconDialogComponentComponent;
  let fixture: ComponentFixture<CreateLexiconDialogComponentComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ CreateLexiconDialogComponentComponent ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLexiconDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

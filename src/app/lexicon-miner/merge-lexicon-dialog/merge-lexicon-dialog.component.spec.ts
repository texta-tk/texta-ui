import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergeLexiconDialogComponent } from './merge-lexicon-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('MergeLexiconDialogComponent', () => {
  let component: MergeLexiconDialogComponent;
  let fixture: ComponentFixture<MergeLexiconDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MergeLexiconDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MergeLexiconDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagDocDialogComponent } from './tagger-group-tag-doc-dialog.component';
import { TaggerGroup } from 'src/app/shared/types/tasks/Tagger';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

describe('TaggerGroupTagDocDialogComponent', () => {
  let component: TaggerGroupTagDocDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const data = {currentProjectId: 1, tagger: new TaggerGroup()};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagDocDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [
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
    fixture = TestBed.createComponent(TaggerGroupTagDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagRandomDocDialogComponent } from './tagger-group-tag-random-doc-dialog.component';
import { TaggerGroup } from 'src/app/shared/types/tasks/Tagger';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

describe('TaggerGroupTagRandomDocDialogComponent', () => {
  let component: TaggerGroupTagRandomDocDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagRandomDocDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const data = {currentProjectId: 1, tagger: new TaggerGroup()};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagRandomDocDialogComponent ],
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
    fixture = TestBed.createComponent(TaggerGroupTagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

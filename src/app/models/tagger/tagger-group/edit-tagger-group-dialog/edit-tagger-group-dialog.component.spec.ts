import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {EditTaggerGroupDialogComponent} from './edit-tagger-group-dialog.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaggerGroup} from '../../../../shared/types/tasks/Tagger';

describe('EditTaggerGroupDialogComponent', () => {
  let component: EditTaggerGroupDialogComponent;
  let fixture: ComponentFixture<EditTaggerGroupDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const taggerGroup = new TaggerGroup();
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EditTaggerGroupDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: taggerGroup
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaggerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {EditEmbeddingDialogComponent} from './edit-embedding-dialog.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Embedding} from '../../../../shared/types/tasks/Embedding';

describe('EditEmbeddingDialogComponent', () => {
  let component: EditEmbeddingDialogComponent;
  let fixture: ComponentFixture<EditEmbeddingDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const embedding = new Embedding();
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EditEmbeddingDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: embedding
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEmbeddingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

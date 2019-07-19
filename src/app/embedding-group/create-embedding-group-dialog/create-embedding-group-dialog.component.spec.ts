import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CreateEmbeddingGroupDialogComponent} from './create-embedding-group-dialog.component';
import {SharedModule} from '../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatDialogRef} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('CreateEmbeddingGroupDialogComponent', () => {
  let component: CreateEmbeddingGroupDialogComponent;
  let fixture: ComponentFixture<CreateEmbeddingGroupDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [CreateEmbeddingGroupDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEmbeddingGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {QueryDialogComponent} from './query-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('QueryDialogComponent', () => {
  let component: QueryDialogComponent;
  let fixture: ComponentFixture<QueryDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {query: JSON.stringify({bool: {must: ['tere']}})};
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QueryDialogComponent],
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
    fixture = TestBed.createComponent(QueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

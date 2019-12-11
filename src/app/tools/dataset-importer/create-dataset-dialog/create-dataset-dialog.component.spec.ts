import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDatasetDialogComponent } from './create-dataset-dialog.component';

describe('CreateDatasetDialogComponent', () => {
  let component: CreateDatasetDialogComponent;
  let fixture: ComponentFixture<CreateDatasetDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDatasetDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDatasetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

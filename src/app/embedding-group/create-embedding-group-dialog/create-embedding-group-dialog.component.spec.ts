import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmbeddingGroupDialogComponent } from './create-embedding-group-dialog.component';

describe('CreateEmbeddingGroupDialogComponent', () => {
  let component: CreateEmbeddingGroupDialogComponent;
  let fixture: ComponentFixture<CreateEmbeddingGroupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEmbeddingGroupDialogComponent ]
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

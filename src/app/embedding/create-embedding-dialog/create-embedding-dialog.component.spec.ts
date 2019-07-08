import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmbeddingDialogComponent } from './create-embedding-dialog.component';

describe('CreateEmbeddingDialogComponent', () => {
  let component: CreateEmbeddingDialogComponent;
  let fixture: ComponentFixture<CreateEmbeddingDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEmbeddingDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEmbeddingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

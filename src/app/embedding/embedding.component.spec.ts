import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddingComponent } from './embedding.component';

describe('EmbeddingComponent', () => {
  let component: EmbeddingComponent;
  let fixture: ComponentFixture<EmbeddingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

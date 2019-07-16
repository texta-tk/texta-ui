import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddingGroupComponent } from './embedding-group.component';

describe('EmbeddingGroupComponent', () => {
  let component: EmbeddingGroupComponent;
  let fixture: ComponentFixture<EmbeddingGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmbeddingGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddingGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

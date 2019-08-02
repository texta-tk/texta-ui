import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LexiconBuilderComponent } from './lexicon-builder.component';

describe('LexiconBuilderComponent', () => {
  let component: LexiconBuilderComponent;
  let fixture: ComponentFixture<LexiconBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LexiconBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LexiconBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

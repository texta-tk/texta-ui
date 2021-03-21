import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenericHighlighterComponent } from './generic-highlighter.component';
import {HighlightSpan} from '../../../searcher/searcher-table/highlight/highlight.component';

describe('GenericHighlighterComponent', () => {
  let component: GenericHighlighterComponent<HighlightSpan>;
  let fixture: ComponentFixture<GenericHighlighterComponent<HighlightSpan>>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericHighlighterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericHighlighterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

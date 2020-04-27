import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextaFactsChipsComponent } from './texta-facts-chips.component';
import {SearcherTableComponent} from '../searcher-table.component';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';

describe('TextaFactsChipsComponent', () => {
  let component: TextaFactsChipsComponent;
  let fixture: ComponentFixture<TextaFactsChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextaFactsChipsComponent ]
    }).overrideComponent(TextaFactsChipsComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextaFactsChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

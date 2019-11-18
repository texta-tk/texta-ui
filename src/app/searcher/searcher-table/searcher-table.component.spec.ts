import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearcherTableComponent } from './searcher-table.component';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HighlightComponent} from './highlight/highlight.component';
import {SearchServiceSpy} from '../services/searcher-component.service.spec';
import {SearcherComponentService} from '../services/searcher-component.service';
import {BuildSearchComponent} from '../searcher-sidebar/build-search/build-search.component';

describe('SearcherTableComponent', () => {
  let component: SearcherTableComponent;
  let fixture: ComponentFixture<SearcherTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
      declarations: [ SearcherTableComponent, HighlightComponent ]
    }).overrideComponent(SearcherTableComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

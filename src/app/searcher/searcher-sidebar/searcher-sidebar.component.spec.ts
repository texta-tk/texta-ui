import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SearcherSidebarComponent} from './searcher-sidebar.component';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BuildSearchComponent} from './build-search/build-search.component';
import {SavedSearchesComponent} from './saved-searches/saved-searches.component';
import {TextConstraintsComponent} from './build-search/text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './build-search/date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './build-search/fact-constraints/fact-constraints.component';
import {FactTextConstraintsComponent} from './build-search/fact-text-constraints/fact-text-constraints.component';

describe('SearcherSidebarComponent', () => {
  let component: SearcherSidebarComponent;
  let fixture: ComponentFixture<SearcherSidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
      declarations: [SearcherSidebarComponent, BuildSearchComponent, SavedSearchesComponent, TextConstraintsComponent,
        DateConstraintsComponent, FactConstraintsComponent, FactTextConstraintsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

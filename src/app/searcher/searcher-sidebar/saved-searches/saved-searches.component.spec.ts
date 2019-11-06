import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SavedSearchesComponent} from './saved-searches.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearchService} from '../../services/search.service';
import {BuildSearchComponent} from '../build-search/build-search.component';
import {SearchServiceSpy} from '../../services/search.service.spec';

describe('SavedSearchesComponent', () => {
  let component: SavedSearchesComponent;
  let fixture: ComponentFixture<SavedSearchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [SavedSearchesComponent]
    }).overrideComponent(SavedSearchesComponent, {
      set: {
        providers: [
          {provide: SearchService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedSearchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

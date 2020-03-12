import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AdvancedSearchComponent} from './advanced-search.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {SavedSearchesComponent} from '../../saved-searches/saved-searches.component';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';

describe('AdvancedSearchComponent', () => {
  let component: AdvancedSearchComponent;
  let fixture: ComponentFixture<AdvancedSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [AdvancedSearchComponent],
      providers: [
        {provide: SearcherComponentService, useClass: SearchServiceSpy}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

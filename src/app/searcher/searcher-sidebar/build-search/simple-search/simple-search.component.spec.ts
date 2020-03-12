import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleSearchComponent } from './simple-search.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SavedSearchesComponent} from '../../saved-searches/saved-searches.component';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';

describe('SimpleSearchComponent', () => {
  let component: SimpleSearchComponent;
  let fixture: ComponentFixture<SimpleSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ SimpleSearchComponent ],
      providers: [
        {provide: SearcherComponentService, useClass: SearchServiceSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {BuildSearchComponent} from './build-search.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TextConstraintsComponent} from './text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './fact-constraints/fact-constraints.component';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {Search} from '../../../shared/types/Search';
import {BehaviorSubject} from 'rxjs';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';


describe('BuildSearchComponent', () => {
  let component: BuildSearchComponent;
  let fixture: ComponentFixture<BuildSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [BuildSearchComponent, TextConstraintsComponent,
        DateConstraintsComponent, FactConstraintsComponent, ]
    }).overrideComponent(BuildSearchComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {BuildSearchComponent} from './build-search.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TextConstraintsComponent} from './advanced-search/text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './advanced-search/date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './advanced-search/fact-constraints/fact-constraints.component';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';


describe('BuildSearchComponent', () => {
  let component: BuildSearchComponent;
  let fixture: ComponentFixture<BuildSearchComponent>;

  beforeEach(waitForAsync(() => {
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

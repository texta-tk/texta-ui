import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {BuildSearchComponent} from './build-search.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherModule} from '../../searcher.module';
import {TextConstraintsComponent} from './text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './fact-constraints/fact-constraints.component';
import {FactTextConstraintsComponent} from './fact-text-constraints/fact-text-constraints.component';

describe('BuildSearchComponent', () => {
  let component: BuildSearchComponent;
  let fixture: ComponentFixture<BuildSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [BuildSearchComponent, TextConstraintsComponent,
        DateConstraintsComponent, FactConstraintsComponent, FactTextConstraintsComponent]
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

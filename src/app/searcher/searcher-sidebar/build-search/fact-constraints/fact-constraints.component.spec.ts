import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactConstraintsComponent } from './fact-constraints.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery, FactConstraint, TextConstraint} from '../Constraints';

describe('FactConstraintsComponent', () => {
  let component: FactConstraintsComponent;
  let fixture: ComponentFixture<FactConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ FactConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    component.factConstraint = new FactConstraint([{path: 'test', type: 'fact'}]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactTextConstraintsComponent } from './fact-text-constraints.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery} from '../Constraints';

describe('FactTextConstraintsComponent', () => {
  let component: FactTextConstraintsComponent;
  let fixture: ComponentFixture<FactTextConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ FactTextConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactTextConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

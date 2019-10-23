import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextConstraintsComponent } from './text-constraints.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery, TextConstraint} from '../Constraints';

describe('TextConstraintsComponent', () => {
  let component: TextConstraintsComponent;
  let fixture: ComponentFixture<TextConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ TextConstraintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    component.textConstraint = new TextConstraint([{path: 'test', type: 'text'}]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

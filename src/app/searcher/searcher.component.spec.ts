import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SearcherComponent} from './searcher.component';
import {SharedModule} from '../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from './services/searcher-component.service';
import {SearchServiceSpy} from './services/searcher-component.service.spec';


describe('SearcherComponent', () => {
  let component: SearcherComponent;
  let fixture: ComponentFixture<SearcherComponent>;
  let windowSpy: jasmine.SpyObj<Window>;
  beforeEach(waitForAsync(() => {
    windowSpy = jasmine.createSpyObj('Window', ['addEventListener', 'removeEventListener']);
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ]
    }).overrideComponent(SearcherComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

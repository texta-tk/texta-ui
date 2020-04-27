import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberConstraintsComponent } from './number-constraints.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../../../services/searcher-component.service';
import {SearchServiceSpy} from '../../../../services/searcher-component.service.spec';

describe('NumberConstraintsComponent', () => {
  let component: NumberConstraintsComponent;
  let fixture: ComponentFixture<NumberConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ NumberConstraintsComponent ],
      providers: [
        {provide: SearcherComponentService, useClass: SearchServiceSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

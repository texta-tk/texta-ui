import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LangDetectComponent } from './lang-detect.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared-module/shared.module';

describe('LangDetectComponent', () => {
  let component: LangDetectComponent;
  let fixture: ComponentFixture<LangDetectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LangDetectComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LangDetectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

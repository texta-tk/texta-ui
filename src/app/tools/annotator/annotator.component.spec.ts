import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotatorComponent } from './annotator.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from "../../shared/shared-module/shared.module";

describe('AnnotatorComponent', () => {
  let component: AnnotatorComponent;
  let fixture: ComponentFixture<AnnotatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AnnotatorComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnnotatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

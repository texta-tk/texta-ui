import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluatorComponent } from './evaluator.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared.module';

describe('EvaluatorComponent', () => {
  let component: EvaluatorComponent;
  let fixture: ComponentFixture<EvaluatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvaluatorComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

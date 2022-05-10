import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfusionMatrixGraphComponent } from './confusion-matrix-graph.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../shared-module/shared.module';

describe('ConfusionMatrixGraphComponent', () => {
  let component: ConfusionMatrixGraphComponent;
  let fixture: ComponentFixture<ConfusionMatrixGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfusionMatrixGraphComponent ],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfusionMatrixGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

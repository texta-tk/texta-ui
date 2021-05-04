import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarizerComponent } from './summarizer.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared.module';

describe('SummarizerComponent', () => {
  let component: SummarizerComponent;
  let fixture: ComponentFixture<SummarizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarizerComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

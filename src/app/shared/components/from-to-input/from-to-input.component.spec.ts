import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FromToInputComponent} from './from-to-input.component';
import {SharedModule} from '../../shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('FromToInputComponent', () => {
  let component: FromToInputComponent;
  let fixture: ComponentFixture<FromToInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      declarations: [FromToInputComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FromToInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

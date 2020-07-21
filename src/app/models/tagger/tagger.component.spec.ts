import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerComponent } from './tagger.component';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('TaggerComponent', () => {
  let component: TaggerComponent;
  let fixture: ComponentFixture<TaggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ TaggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

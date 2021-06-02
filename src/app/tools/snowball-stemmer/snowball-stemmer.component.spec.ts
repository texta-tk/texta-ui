import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnowballStemmerComponent } from './snowball-stemmer.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared.module';

describe('SnowballStemmerComponent', () => {
  let component: SnowballStemmerComponent;
  let fixture: ComponentFixture<SnowballStemmerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnowballStemmerComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnowballStemmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

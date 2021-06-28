import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFieldsTaggerComponent } from './search-fields-tagger.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../shared/shared.module';

describe('SearchFieldsTaggerComponent', () => {
  let component: SearchFieldsTaggerComponent;
  let fixture: ComponentFixture<SearchFieldsTaggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFieldsTaggerComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFieldsTaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

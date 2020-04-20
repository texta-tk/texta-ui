import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewClusterDocumentsComponent } from './view-cluster-documents.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ViewClusterDocumentsComponent', () => {
  let component: ViewClusterDocumentsComponent;
  let fixture: ComponentFixture<ViewClusterDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewClusterDocumentsComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewClusterDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

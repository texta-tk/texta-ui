import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClusteringComponent } from './clustering.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ClusteringComponent', () => {
  let component: ClusteringComponent;
  let fixture: ComponentFixture<ClusteringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClusteringComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

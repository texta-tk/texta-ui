import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbeddingGroupComponent } from './embedding-group.component';
import {SharedModule} from '../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('EmbeddingGroupComponent', () => {
  let component: EmbeddingGroupComponent;
  let fixture: ComponentFixture<EmbeddingGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        BrowserAnimationsModule,
        HttpClientTestingModule
      ],
      declarations: [ EmbeddingGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmbeddingGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

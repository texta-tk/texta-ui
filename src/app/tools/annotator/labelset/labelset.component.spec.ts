import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsetComponent } from './labelset.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('LabelsetComponent', () => {
  let component: LabelsetComponent;
  let fixture: ComponentFixture<LabelsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabelsetComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerFineTuneSliderComponent } from './tagger-fine-tune-slider.component';
import {SharedModule} from '../../shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('TaggerFineTuneSliderComponent', () => {
  let component: TaggerFineTuneSliderComponent;
  let fixture: ComponentFixture<TaggerFineTuneSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      declarations: [ TaggerFineTuneSliderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerFineTuneSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

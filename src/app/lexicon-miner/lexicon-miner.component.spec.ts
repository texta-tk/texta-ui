import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LexiconMinerComponent } from './lexicon-miner.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('LexiconMinerComponent', () => {
  let component: LexiconMinerComponent;
  let fixture: ComponentFixture<LexiconMinerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LexiconMinerComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LexiconMinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

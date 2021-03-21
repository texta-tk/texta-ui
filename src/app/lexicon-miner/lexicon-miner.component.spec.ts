import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LexiconMinerComponent } from './lexicon-miner.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {LexiconBuilderComponent} from './lexicon-builder/lexicon-builder.component';

describe('LexiconMinerComponent', () => {
  let component: LexiconMinerComponent;
  let fixture: ComponentFixture<LexiconMinerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LexiconMinerComponent, LexiconBuilderComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
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

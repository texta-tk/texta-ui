import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LexiconMinerComponent } from './lexicon-miner.component';

describe('LexiconMinerComponent', () => {
  let component: LexiconMinerComponent;
  let fixture: ComponentFixture<LexiconMinerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LexiconMinerComponent ]
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

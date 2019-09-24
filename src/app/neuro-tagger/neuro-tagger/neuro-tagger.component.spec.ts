import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NeuroTaggerComponent } from './neuro-tagger.component';

describe('NeuroTaggerComponent', () => {
  let component: NeuroTaggerComponent;
  let fixture: ComponentFixture<NeuroTaggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NeuroTaggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NeuroTaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

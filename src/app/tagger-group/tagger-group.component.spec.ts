import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupComponent } from './tagger-group.component';

describe('TaggerGroupComponent', () => {
  let component: TaggerGroupComponent;
  let fixture: ComponentFixture<TaggerGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

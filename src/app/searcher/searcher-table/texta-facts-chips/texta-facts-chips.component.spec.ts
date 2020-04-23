import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextaFactsChipsComponent } from './texta-facts-chips.component';

describe('TextaFactsChipsComponent', () => {
  let component: TextaFactsChipsComponent;
  let fixture: ComponentFixture<TextaFactsChipsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextaFactsChipsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextaFactsChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

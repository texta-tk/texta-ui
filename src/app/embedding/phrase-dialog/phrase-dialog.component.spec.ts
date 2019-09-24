import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhraseDialogComponent } from './phrase-dialog.component';

describe('PhraseDialogComponent', () => {
  let component: PhraseDialogComponent;
  let fixture: ComponentFixture<PhraseDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhraseDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhraseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

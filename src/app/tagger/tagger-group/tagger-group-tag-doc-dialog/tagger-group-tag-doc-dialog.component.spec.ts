import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagDocDialogComponent } from './tagger-group-tag-doc-dialog.component';

describe('TaggerGroupTagDocDialogComponent', () => {
  let component: TaggerGroupTagDocDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagDocDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerGroupTagDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

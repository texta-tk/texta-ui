import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagRandomDocDialogComponent } from './tagger-group-tag-random-doc-dialog.component';

describe('TaggerGroupTagRandomDocDialogComponent', () => {
  let component: TaggerGroupTagRandomDocDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagRandomDocDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagRandomDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerGroupTagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

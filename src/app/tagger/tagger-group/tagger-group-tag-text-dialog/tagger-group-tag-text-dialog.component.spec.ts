import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggerGroupTagTextDialogComponent } from './tagger-group-tag-text-dialog.component';

describe('TaggerGroupTagTextDialogComponent', () => {
  let component: TaggerGroupTagTextDialogComponent;
  let fixture: ComponentFixture<TaggerGroupTagTextDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaggerGroupTagTextDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaggerGroupTagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

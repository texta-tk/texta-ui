import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagRandomDocDialogComponent } from './tag-random-doc-dialog.component';

describe('TagRandomDocDialogComponent', () => {
  let component: TagRandomDocDialogComponent;
  let fixture: ComponentFixture<TagRandomDocDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TagRandomDocDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagRandomDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

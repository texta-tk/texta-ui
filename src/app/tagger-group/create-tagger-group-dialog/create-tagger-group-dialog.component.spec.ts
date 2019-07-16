import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaggerGroupDialogComponent } from './create-tagger-group-dialog.component';

describe('CreateTaggerGroupDialogComponent', () => {
  let component: CreateTaggerGroupDialogComponent;
  let fixture: ComponentFixture<CreateTaggerGroupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTaggerGroupDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaggerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

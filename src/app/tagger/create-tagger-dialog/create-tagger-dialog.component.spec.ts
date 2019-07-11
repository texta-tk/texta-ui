import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTaggerDialogComponent } from './create-tagger-dialog.component';

describe('CreateTaggerDialogComponent', () => {
  let component: CreateTaggerDialogComponent;
  let fixture: ComponentFixture<CreateTaggerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTaggerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

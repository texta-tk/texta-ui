import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTorchTaggerDialogComponent } from './create-torch-tagger-dialog.component';

describe('CreateTorchTaggerDialogComponent', () => {
  let component: CreateTorchTaggerDialogComponent;
  let fixture: ComponentFixture<CreateTorchTaggerDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTorchTaggerDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTorchTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorchTagTextDialogComponent } from './torch-tag-text-dialog.component';

describe('TorchTagTextDialogComponent', () => {
  let component: TorchTagTextDialogComponent;
  let fixture: ComponentFixture<TorchTagTextDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorchTagTextDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorchTagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

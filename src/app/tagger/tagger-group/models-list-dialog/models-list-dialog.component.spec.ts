import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsListDialogComponent } from './models-list-dialog.component';

describe('ModelsListDialogComponent', () => {
  let component: ModelsListDialogComponent;
  let fixture: ComponentFixture<ModelsListDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModelsListDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

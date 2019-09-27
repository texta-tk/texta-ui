import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSearchDialogComponent } from './save-search-dialog.component';

describe('SaveSearchDialogComponent', () => {
  let component: SaveSearchDialogComponent;
  let fixture: ComponentFixture<SaveSearchDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveSearchDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

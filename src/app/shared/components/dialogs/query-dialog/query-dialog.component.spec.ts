import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryDialogComponent } from './query-dialog.component';

describe('QueryDialogComponent', () => {
  let component: QueryDialogComponent;
  let fixture: ComponentFixture<QueryDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

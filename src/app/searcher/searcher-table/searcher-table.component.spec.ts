import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearcherTableComponent } from './searcher-table.component';

describe('SearcherTableComponent', () => {
  let component: SearcherTableComponent;
  let fixture: ComponentFixture<SearcherTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearcherTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

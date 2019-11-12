import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedSearchAutocompleteComponent } from './saved-search-autocomplete.component';
import { SharedModule } from '../../shared.module';

describe('SavedSearchAutocompleteComponent', () => {
  let component: SavedSearchAutocompleteComponent;
  let fixture: ComponentFixture<SavedSearchAutocompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ SavedSearchAutocompleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavedSearchAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

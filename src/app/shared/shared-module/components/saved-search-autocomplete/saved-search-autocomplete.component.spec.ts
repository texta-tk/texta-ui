import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavedSearchAutocompleteComponent } from './saved-search-autocomplete.component';
import { SharedModule } from '../../shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SavedSearchAutocompleteComponent', () => {
  let component: SavedSearchAutocompleteComponent;
  let fixture: ComponentFixture<SavedSearchAutocompleteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, HttpClientTestingModule, BrowserAnimationsModule],
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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SaveSearchDialogComponent} from './save-search-dialog.component';
import {SharedModule} from '../../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatDialogRef} from '@angular/material';
import {Search} from '../../../../shared/types/Search';
import {BehaviorSubject} from 'rxjs';
import {SearchService} from '../../../services/search.service';
import {BuildSearchComponent} from '../../build-search/build-search.component';
import {SearchServiceSpy} from '../../../services/search.service.spec';

describe('SaveSearchDialogComponent', () => {
  let component: SaveSearchDialogComponent;
  let fixture: ComponentFixture<SaveSearchDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [SaveSearchDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }]
    }).overrideComponent(BuildSearchComponent, {
      set: {
        providers: [
          {provide: SearchService, useClass: SearchServiceSpy}
        ]
      }
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

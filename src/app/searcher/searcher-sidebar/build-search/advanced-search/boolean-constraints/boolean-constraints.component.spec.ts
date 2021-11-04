import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BooleanConstraintsComponent} from './boolean-constraints.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../../../services/searcher-component.service';
import {SearchServiceSpy} from '../../../../services/searcher-component.service.spec';

describe('BooleanConstraintsComponent', () => {
  let component: BooleanConstraintsComponent;
  let fixture: ComponentFixture<BooleanConstraintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [BooleanConstraintsComponent],
      providers: [
        {provide: SearcherComponentService, useClass: SearchServiceSpy}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanConstraintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

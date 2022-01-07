import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoIconPortalComponent } from './info-icon-portal.component';
import {SharedModule} from '../../../shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {INFO_PORTAL_DATA} from '../InfoPortalData';

describe('InfoIconPortalComponent', () => {
  let component: InfoIconPortalComponent;
  let fixture: ComponentFixture<InfoIconPortalComponent>;
  const data = {overlayRef: undefined, textTemplate: '<p>tere</p>', title: 'yo'};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoIconPortalComponent ],

      imports: [SharedModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: INFO_PORTAL_DATA,
          useValue: data
        }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoIconPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GraphSelectedPortalComponent } from './graph-selected-portal.component';
import {PORTAL_DATA} from '../PortalToken';

describe('GraphSelectedPortalComponent', () => {
  let component: GraphSelectedPortalComponent;
  let fixture: ComponentFixture<GraphSelectedPortalComponent>;

  const data = {total: 20};
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphSelectedPortalComponent ],
      providers: [
        {
          provide: PORTAL_DATA,
          useValue: data
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphSelectedPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

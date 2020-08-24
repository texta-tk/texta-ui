import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UaaOauthComponent } from './uaa-oauth.component';

describe('UaaOauthComponent', () => {
  let component: UaaOauthComponent;
  let fixture: ComponentFixture<UaaOauthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UaaOauthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UaaOauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

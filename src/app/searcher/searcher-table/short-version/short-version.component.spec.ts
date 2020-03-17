import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ShortVersionComponent} from './short-version.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../../shared/shared.module';

describe('ShortVersionComponent', () => {
  let component: ShortVersionComponent;
  let fixture: ComponentFixture<ShortVersionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, SharedModule
      ],
      declarations: [ShortVersionComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

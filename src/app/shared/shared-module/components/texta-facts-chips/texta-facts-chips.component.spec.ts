import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TextaFactsChipsComponent } from './texta-facts-chips.component';
import {SearcherComponentService} from '../../../../searcher/services/searcher-component.service';
import {SearchServiceSpy} from '../../../../searcher/services/searcher-component.service.spec';

describe('TextaFactsChipsComponent', () => {
  let component: TextaFactsChipsComponent;
  let fixture: ComponentFixture<TextaFactsChipsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TextaFactsChipsComponent ]
    }).overrideComponent(TextaFactsChipsComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextaFactsChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

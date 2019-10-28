import {
  async,
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick
} from '@angular/core/testing';

import {TextConstraintsComponent} from './text-constraints.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery, TextConstraint} from '../Constraints';
import {By} from '@angular/platform-browser';

describe('TextConstraintsComponent', () => {
  let component: TextConstraintsComponent;
  let fixture: ComponentFixture<TextConstraintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [TextConstraintsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    component.textConstraint = new TextConstraint([{path: 'test', type: 'text'}]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

/*  it('should generate the correct query with text changing', fakeAsync(() => {
    debugger;
    const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
    textarea.value = 'tere';
    textarea.dispatchEvent(new Event('input'));
    tick(10000);
    fixture.detectChanges();
    tick(300); // debouncetime 200 valuechanges
    const matSelect = fixture.debugElement.query(By.css('.selectMatch')).nativeElement;
    matSelect.click();
    tick(10000);
    fixture.detectChanges();
    const selectOptions = fixture.debugElement.queryAll(By.css('mat-option'))[2].nativeElement;
    selectOptions.click();
    tick(10000);
    fixture.detectChanges();
    console.log(selectOptions);
    console.log(component.matchFormControl);
    component.ngOnDestroy();
  }));*/
});

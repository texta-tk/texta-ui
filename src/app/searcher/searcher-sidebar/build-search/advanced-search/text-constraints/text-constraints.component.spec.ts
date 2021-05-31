import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {TextConstraintsComponent} from './text-constraints.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery, TextConstraint} from '../../Constraints';

describe('TextConstraintsComponent', () => {
  let component: TextConstraintsComponent;
  let fixture: ComponentFixture<TextConstraintsComponent>;
  // tslint:disable-next-line:max-line-length no-any
  const constraintQueryAccessor = ((x: { bool: { [x: string]: { [x: string]: { bool: { should: { [x: string]: any; }[]; }; }; }; }; }, i: string | number, operator: 'must' | 'must_not' | 'should', type: 'multi_match' | 'regexp') => x.bool[operator][i].bool.should[0][type]);

  beforeEach(waitForAsync(() => {
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
  it('should create the correct query when setting textarea text', () => {

    component.matchFormControl.setValue('phrase_prefix');
    component.textAreaFormControl.setValue('test');
    const generatedQueryBlock = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'multi_match');
    expect(generatedQueryBlock.query).toBe('test');

    component.textAreaFormControl.setValue('test\ntere');
    const query1 = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'multi_match');
    const query2 = constraintQueryAccessor(component.constraintQuery, 1, 'must', 'multi_match');
    expect(query1.query).toBe('test');
    expect(query2.query).toBe('tere');
  });
  it('should disable slop on regexp query', () => {
    component.matchFormControl.setValue('regexp');
    expect(component.slopFormControl.disabled).toBeTruthy();
  });
  it('should generate correct query when changing match type', () => {
    component.textAreaFormControl.setValue('test');
    component.matchFormControl.setValue('phrase_prefix');
    let query = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'multi_match');
    expect(query.type).toBe('phrase_prefix');

    component.matchFormControl.setValue('best_fields');
    query = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'multi_match');
    expect(query.type).toBe('best_fields');


    component.matchFormControl.setValue('phrase');
    query = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'multi_match');
    expect(query.type).toBe('phrase');

    component.matchFormControl.setValue('regexp');
    query = constraintQueryAccessor(component.constraintQuery, 0, 'must', 'regexp');
    expect(query.test).toBe('test');
  });

  it('should generate correct query when changing operator', () => {
    component.textAreaFormControl.setValue('test');
    for (const operator of ['must', 'should', 'must_not']) {
      component.operatorFormControl.setValue(operator);
      const query = constraintQueryAccessor(component.constraintQuery, 0, component.operatorFormControl.value, 'multi_match');
      expect(query.query).toBe('test');
    }
  });

  it('should generate correct query when using regexp', () => {
    component.matchFormControl.setValue('regexp');
    component.textAreaFormControl.setValue('tere');
    const query = constraintQueryAccessor(component.constraintQuery, 0, component.operatorFormControl.value, 'regexp');
    expect(query).toBeTruthy();
  });
});

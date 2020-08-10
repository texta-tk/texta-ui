import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {FactConstraintsComponent} from './fact-constraints.component';
import {SharedModule} from '../../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ElasticsearchQuery, FactConstraint, TextConstraint} from '../../Constraints';
import {of} from 'rxjs';
import {ProjectService} from '../../../../../core/projects/project.service';
import {Project} from '../../../../../shared/types/Project';

describe('FactConstraintsComponent', () => {
  let component: FactConstraintsComponent;
  let fixture: ComponentFixture<FactConstraintsComponent>;

  // tslint:disable-next-line:no-any
  const innerFactAccessor = (x: { bool: any; }, i: number, operator: 'must' | 'must_not' | 'should', multi?: boolean) =>
    (multi ? x.bool[operator] : x.bool[operator][i]).nested.query.bool.must;
  // tslint:disable-next-line:no-any
  const innerNestedAccessor = (x: { nested: any; }) => x.nested.query.bool.must;
  let factValueAutoComplete;
  beforeEach(async(() => {
    const projectService = jasmine.createSpyObj('ProjectService', ['projectFactValueAutoComplete']);
    factValueAutoComplete = projectService.projectFactValueAutoComplete.and.returnValue(of(['Putin', 'Donald', 'Mao', 'Stalin', 'Hitler']));

    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [FactConstraintsComponent],
      providers: [
        {provide: ProjectService, useValue: projectService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    component.factConstraint = new FactConstraint([{path: 'test', type: 'fact'}]);
    fixture.detectChanges();
  });

  it('should generate correct query for fact name', () => {
    component.createGroupListeners();
    const factNames = ['PER', 'LOC', 'ORG'];
    component.factNameFormControl.setValue(factNames);
    let index = 0;
    for (const f of factNames) {
      const innerFactQuery = innerFactAccessor(component.factNameQuery, index, 'must')[0].match;
      expect(innerFactQuery['texta_facts.fact']).toBe(f);
      index++;
    }
  });

  it('should not be able to select inputgroup fact value unless fact name', () => {
    for (const inputGroup of component._factConstraint.inputGroupArray) {
      expect(inputGroup.factTextInputFormControl.disabled).toBeTruthy();
    }
  });

  it('inputgroup should generate correct query when fact name, value', fakeAsync(() => {
    component.currentProject = new Project();
    for (const inputGroup of component._factConstraint.inputGroupArray) {
      inputGroup.factTextFactNameFormControl.setValue('PER');
      inputGroup.factTextInputFormControl.setValue('Putin');
      tick(200);
      expect(inputGroup.filteredOptions.length).toBeGreaterThan(0);
      component.factValueSelected(inputGroup.filteredOptions[0], inputGroup);
      for (const query of innerNestedAccessor(inputGroup.formQuery)) {
        if (query.match.hasOwnProperty('texta_facts.fact')) {
          expect(query.match['texta_facts.fact']).toEqual('PER', 'expected fact name to be PER');
        } else {
          expect(query.match['texta_facts.str_val']).toEqual('Putin', 'expected fact value to be Putin');
        }
      }
    }
  }));

  it('inputgroup operator should generate correct query', fakeAsync(() => {
    component.currentProject = new Project();
    for (const inputGroup of component._factConstraint.inputGroupArray) {
      inputGroup.factTextFactNameFormControl.setValue('PER');
      inputGroup.factTextInputFormControl.setValue('Putin');
      tick(200);
      component.factValueSelected(inputGroup.filteredOptions[0], inputGroup);
      const operators: ['must', 'must_not', 'should'] = ['must', 'must_not', 'should'];
      for (const operator of operators) {
        inputGroup.factTextOperatorFormControl.setValue(operator);
        expect(innerFactAccessor(inputGroup.query, 0, operator, true).length).toBeGreaterThan(0);
      }
    }
  }));
});

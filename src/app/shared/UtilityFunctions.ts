import {
  Constraint,
  DateConstraint,
  FactConstraint,
  NumberConstraint,
  TextConstraint
} from '../searcher/searcher-sidebar/build-search/Constraints';

export interface LegibleColor {
  backgroundColor: string;
  textColor: string;
}

export class UtilityFunctions {
  static colors: Map<string, LegibleColor> = new Map<string, LegibleColor>([
    ['ORG', {backgroundColor: '#9FC2BA', textColor: 'black'}],
    ['PER', {backgroundColor: '#DDB0A0', textColor: 'black'}],
    ['GPE', {backgroundColor: '#ffb2ff', textColor: 'black'}],
    ['LOC', {backgroundColor: '#CABD80', textColor: 'black'}],
    ['ADDR', {backgroundColor: '#8f9bff', textColor: 'black'}],
    ['COMPANY', {backgroundColor: '#75a7ff', textColor: 'black'}],
    ['PHO', {backgroundColor: '#ff867f', textColor: 'black'}],
    ['EMAIL', {backgroundColor: '#9fffe0', textColor: 'black'}],
  ]);

  static typeGuard<T>(o: unknown, className: new(...args: unknown[]) => T): o is T {
    return o instanceof className;
  }

  static propertiesToArray<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
    return propertyNames.map(n => o[n]);
  }

  /*
  * check if each array element exists in both arrays for each element
  * */
  static arrayValuesEqual<T>(arr1: T[], arr2: T[], accessor?: (x: T) => unknown): boolean {
    if (arr1?.length === arr2?.length) {
      if (accessor) {
        return arr1.every(x => arr2.find(y => accessor(y) === accessor(x)));
      } else {
        return arr1.every(x => arr2.includes(x));
      }
    } else {
      return false;
    }
  }

  static sortByStringProperty<T>(object: T[], propertyAccessor: (x: T) => string): T[] {
    return object.sort((a, b) => {
      const propertyA = propertyAccessor(a).toUpperCase();
      const propertyB = propertyAccessor(b).toUpperCase();
      if (propertyA < propertyB) {
        return -1;
      }
      if (propertyA > propertyB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
  }

  // tslint:disable-next-line:no-any
  static getDistinctByProperty<T>(objectArray: T[], propertyAccessor: (x: T) => any): T[] {
    const distinct: T[] = [];
    const unique: boolean[] = [];
    for (const el of objectArray) {
      if (!unique[propertyAccessor(el)]) {
        distinct.push(el);
        unique[propertyAccessor(el)] = true;
      }
    }
    return distinct;
  }

  // tslint:disable-next-line:no-any
  static convertConstraintListToJson(constraintList: Constraint[]): any[] {
    // tslint:disable-next-line:no-any
    const outPutJson: any[] = [];
    for (const constraint of constraintList) {
      if (constraint instanceof TextConstraint) {
        outPutJson.push({
          fields: constraint.fields,
          match: constraint.matchFormControl.value,
          slop: constraint.slopFormControl.value,
          text: constraint.textAreaFormControl.value,
          operator: constraint.operatorFormControl.value,
          fuzziness: constraint.fuzzinessFormControl.value,
          prefix_length: constraint.prefixLengthFormControl.value
        });
      }
      if (constraint instanceof DateConstraint) {
        outPutJson.push({
          fields: constraint.fields,
          dateFrom: constraint.dateFromFormControl.value,
          dateTo: constraint.dateToFormControl.value
        });
      }

      if (constraint instanceof NumberConstraint) {
        outPutJson.push({
          fields: constraint.fields,
          fromToInput: constraint.fromToInput,
          operator: constraint.operatorFormControl.value
        });
      }
      if (constraint instanceof FactConstraint) {
        // tslint:disable-next-line:no-any
        const inputGroupArrayJson: any[] = [];
        for (const inputGroup of constraint.inputGroupArray) {
          inputGroupArrayJson.push({
            factTextOperator: inputGroup.factTextOperatorFormControl.value,
            factTextName: inputGroup.factTextFactNameFormControl.value,
            factTextInput: inputGroup.factTextInputFormControl.value
          });
        }

        outPutJson.push({
          fields: constraint.fields,
          factName: constraint.factNameFormControl.value,
          factNameOperator: constraint.factNameOperatorFormControl.value,
          factTextOperator: constraint.factTextOperatorFormControl.value,
          inputGroup: inputGroupArrayJson
        })
        ;
      }
    }
    return outPutJson;

  }

  static generateColorsForFacts(facts: { fact: string; str_val?: string }[]): Map<string, LegibleColor> {
    facts.forEach(fact => {
      if (!UtilityFunctions.colors.has(fact.fact)) {
        // tslint:disable-next-line:no-bitwise
        UtilityFunctions.colors.set(fact.fact, {backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
          textColor: 'black'
        });
      }
    });
    return UtilityFunctions.colors;
  }
}

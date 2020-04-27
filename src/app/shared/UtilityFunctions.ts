export class UtilityFunctions {
  static typeGuard<T>(o, className: { new(...args: any[]): T }): o is T {
    return o instanceof className;
  }

  static propertiesToArray<T, K extends keyof T>(o: T, propertyNames: K[]): T[K][] {
    return propertyNames.map(n => o[n]);
  }
  /*
  * check if each array element exists in both arrays for each element
  * */
  static arrayValuesEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length === arr2.length) {
      return arr1.every(x => arr2.includes(x));
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

}

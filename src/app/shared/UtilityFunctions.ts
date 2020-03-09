export class UtilityFunctions {
  static typeGuard<T>(o, className: { new(...args: any[]): T }): o is T {
    return o instanceof className;
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

  static sortByStringProperty(object: any[], propertyAccsessor: (x: any) => string) {
    return object.sort((a, b) => {
      const propertyA = propertyAccsessor(a).toUpperCase();
      const propertyB = propertyAccsessor(b).toUpperCase();
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

}

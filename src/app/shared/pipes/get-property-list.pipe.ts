import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'getPropertyList'
})
export class GetPropertyListPipe implements PipeTransform {

  transform<T>(value: T[], propertyAccessor: (x: T) => unknown): unknown[] {
    const returnValue: unknown[] = [];
    value.forEach(x => {
      returnValue.push(propertyAccessor(x));
    });
    return returnValue;
  }

}

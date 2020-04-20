import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'getPropertyList'
})
export class GetPropertyListPipe implements PipeTransform {

  transform<T>(value: T[], propertyAccessor: (x: T) => any): any[] {
    const returnValue: any = [];
    value.forEach(x => {
      returnValue.push(propertyAccessor(x));
    });
    return returnValue;
  }

}

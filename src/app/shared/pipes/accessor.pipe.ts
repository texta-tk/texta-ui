import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'accessor',
  pure: true,
})
export class AccessorPipe implements PipeTransform {

  transform<T>(value: T | undefined, propertyAccessor: (x: T) => string): string {
    if (value) {
      return propertyAccessor(value);
    }
    return '';
  }

}

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'combineArray'
})
export class CombineArrayPipe<T> implements PipeTransform {

  transform(value: T[], args: T[][]): T[] {
    for (const el of args) {
      if (el.length > 0) {
        value = [...value, ...el];
      }
    }
    return value;
  }

}

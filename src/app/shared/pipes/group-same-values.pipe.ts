import { Pipe, PipeTransform } from '@angular/core';
import {HighlightSpan} from '../../searcher/searcher-table/highlight/highlight.component';

@Pipe({
  name: 'groupSameValues',
  pure: true
})
export class GroupSameValuesPipe implements PipeTransform {

  transform(value: string[], ...args: unknown[]): { key: string, val: number }[] {
    const returnValue: { key: string, val: number }[] = [];
    value.forEach(val => {
      const obj = returnValue.find(x => x.key === val);
      if (obj) {
        obj.val += 1;
      } else {
        returnValue.push({key: val, val: 1});
      }
    });
    return returnValue;
  }

}

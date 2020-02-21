import {Pipe, PipeTransform} from '@angular/core';
import {TextaFact} from '../../searcher/searcher-table/highlight/highlight.component';

@Pipe({
  name: 'formatTextaFacts',
  pure: true,
})
export class FormatTextaFactsPipe implements PipeTransform {

  transform(value: TextaFact[], ...args: any[]): { key: string, val: string[] }[] {
    const returnValue: { key: string, val: string[] }[] = [];
    value.forEach(val => {
      const obj = returnValue.find(x => x.key === val.fact);
      if (obj && obj.val) {
        obj.val.push(val.str_val);
      } else {
        returnValue.push({key: val.fact, val: [val.str_val]});
      }
    });
    return returnValue;
  }

}

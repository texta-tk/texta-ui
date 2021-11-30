import {Pipe, PipeTransform} from '@angular/core';
import {HighlightSpan} from '../../../searcher/searcher-table/highlight/highlight.component';

@Pipe({
  name: 'formatTextaFacts',
  pure: true,
})
export class FormatTextaFactsPipe implements PipeTransform {

  transform(value: HighlightSpan[], ...args: unknown[]): { key: string, val: string[] }[] {
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

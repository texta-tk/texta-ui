import {Pipe, PipeTransform} from '@angular/core';
import {TextaFact} from '../../searcher/searcher-table/highlight/highlight.component';

@Pipe({
  name: 'formatTextaFacts'
})
export class FormatTextaFactsPipe implements PipeTransform {

  transform(value: TextaFact[], ...args: any[]): Map<string, string[]> {
    const returnValue = new Map<string, string[]>();
    value.forEach(val => {
      if (returnValue.has(val.fact)) {
        returnValue.get(val.fact).push(val.str_val);
      } else {
        returnValue.set(val.fact, [val.str_val]);
      }
    });
    return returnValue;
  }

}

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'parseJson',
  pure: true,
})
export class ParseJsonPipe implements PipeTransform {

  // tslint:disable-next-line:no-any
  transform(value: string | undefined): any {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return undefined;
  }

}

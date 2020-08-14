import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {

  transform<T>(value: T[], joinString: string): string {
    if (value) {
      return value.join(joinString);
    }
    return '';
  }

}

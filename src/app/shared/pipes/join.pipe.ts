import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join'
})
export class JoinPipe implements PipeTransform {

  transform<T>(value: T[], joinString: string): string {
    return value.join(joinString);
  }

}

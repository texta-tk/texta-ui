import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'isObject',
    pure: true
})
export class IsObjectPipe implements PipeTransform {

    transform(value: any, ...args: any[]): any {
        if (!value || (!(value instanceof Map) && typeof value !== 'object')) {
            return null;
        }
        return value;
    }

}

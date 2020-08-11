import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'isObject',
    pure: true
})
export class IsObjectPipe implements PipeTransform {

    transform(value: unknown, ...args: unknown[]): object | null {
        if (!value || (!(value instanceof Map) && typeof value !== 'object')) {
            return null;
        }
        return value;
    }

}

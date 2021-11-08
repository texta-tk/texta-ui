import { Pipe, PipeTransform, Optional, Inject } from '@angular/core';
import {FileInputConfig, MAT_FILE_INPUT_CONFIG} from '../types/file-input';

@Pipe({
  name: 'byteFormat'
})
export class ByteFormatPipe implements PipeTransform {
  private unit: string;

  constructor(
    @Optional()
    @Inject(MAT_FILE_INPUT_CONFIG)
    private config: FileInputConfig
  ) {
    this.unit = config ? config.sizeUnit : 'Byte';
  }

  // tslint:disable-next-line:no-any
  transform(value: any, args?: any): any {
    if (parseInt(value, 10) >= 0) {
      value = this.formatBytes(+value, +args);
    }
    return value;
  }

  private formatBytes(bytes: number, decimals?: number): string {
    if (bytes === 0) {
      return '0 ' + this.unit;
    }
    const B = this.unit.charAt(0);
    const k = 1024;
    const dm = decimals || 2;
    const sizes = [this.unit, 'K' + B, 'M' + B, 'G' + B, 'T' + B, 'P' + B, 'E' + B, 'Z' + B, 'Y' + B];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// tslint:disable:no-any
import {AbstractControl, FormGroupDirective, NgControl, NgForm, ValidatorFn} from '@angular/forms';
import {ErrorStateMatcher, mixinErrorState} from '@angular/material/core';
import {InjectionToken} from '@angular/core';
import {Subject} from 'rxjs';

export const MAT_FILE_INPUT_CONFIG = new InjectionToken<FileInputConfig>(
  'mat-file-input.config'
);

export class FileInputConfig {
  /**
   * Unit used with the ByteFormatPipe, default value is *Byte*.
   * The first letter is used for the short notation.
   */
  sizeUnit: string;
}

// tslint:disable:variable-name
export function maxContentSize(bytes: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const size = control && control.value ? (control.value as FileInput).files.map(f => f.size).reduce((acc, i) => acc + i, 0) : 0;
    const condition = bytes >= size;
    return condition
      ? null
      : {
        maxContentSize: {
          actualSize: size,
          maxSize: bytes
        }
      };
  };
}

export class FileInputBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl,
    public stateChanges: Subject<void>
  ) {
  }
}

export class FileInput {
  private _fileNames: string;

  constructor(private _files: File[] | null, private delimiter: string = ', ') {
    this._fileNames = (this._files || []).map((f: File) => f.name).join(delimiter);
  }

  get files(): File[] {
    return this._files || [];
  }

  get fileNames(): string {
    return this._fileNames;
  }
}

/**
 * Allows to use a custom ErrorStateMatcher with the file-input component
 */
export const FileInputMixinBase = mixinErrorState(FileInputBase);

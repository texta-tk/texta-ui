import { ErrorStateMatcher } from '@angular/material/core';
import {UntypedFormControl, FormGroupDirective, NgForm} from '@angular/forms';

// more responsive to user
export class LiveErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

/** Error when the parent is invalid */
export class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.dirty && control.parent && control.parent.invalid);
  }
}

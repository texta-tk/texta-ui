import {Component, ElementRef, Input, OnDestroy, OnInit, Optional, Self} from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormGroup, NgControl, ValidatorFn} from '@angular/forms';
import {Subject} from 'rxjs';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {FocusMonitor} from '@angular/cdk/a11y';
import {takeUntil} from 'rxjs/operators';
import {MatFormFieldControl} from '@angular/material/form-field';

export class FromToInput {
  constructor(public from: number, public to: number) {
  }
}

@Component({
  selector: 'app-from-to-input',
  templateUrl: './from-to-input.component.html',
  styleUrls: ['./from-to-input.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: FromToInputComponent}],
  host: {
    '[class.host-floating-label]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class FromToInputComponent implements ControlValueAccessor, MatFormFieldControl<FromToInput>, OnDestroy, OnInit {
  static nextId = 0;
  parts: FormGroup;
  stateChanges = new Subject<void>();

  checkValidators = new Subject<void>();
  destroy = new Subject<boolean>();
  focused = false;

  errorState = false;

  controlType = 'app-from-to-input';
  id = `app-from-to-input-${FromToInputComponent.nextId++}`;
  describedBy = '';

  previousFrom = 0;
  previousTo = 0;
  readonly autofilled: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl) {

    this.parts = formBuilder.group({
      from: '',
      to: '',
    });

    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  get empty() {
    const {value: {from, to}} = this.parts;

    return !from && !to;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  private _placeholder: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  private _required = false;

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }

  @Input()
  get value(): FromToInput | null {
    const {value: {from, to}} = this.parts;
    if (from >= 0 && to >= from) {
      return new FromToInput(Number(from), Number(to));
    } else {
      return new FromToInput(Number(from), Number(from));
    }
  }

  set value(tel: FromToInput | null) {
    const {from, to} = tel || new FromToInput(0, 0);
    this.parts.setValue({from, to});
    this.checkValidators.next();
    this.stateChanges.next();
  }

  onChange = (_: any) => {
    const from = _.from === '' ? '' : Number(_.from);
    const to = _.to === '' ? '' : Number(_.to);
    if (_.from !== '' && isNaN(from as number) || _.to !== '' && isNaN(to as number)) {
      // user enters a letter isntead of a number.
      if (this.ngControl && this.ngControl.control) {
        this.ngControl.control.setValue({from: this.previousFrom, to: this.previousTo});
      }
      this.writeValue(new FromToInput(this.previousFrom, this.previousTo));
      return false;
    }
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue({from, to});
    }
    this.previousFrom = +from;
    this.previousTo = +to;
  };

  onTouched = () => {
    const from = Number(this.parts.value.from);
    let to = Number(this.parts.value.to);
    if (!isNaN(from) && !isNaN(to)) {
      if (to < from) {
        to = from;
        if (this.ngControl && this.ngControl.control) {
          this.ngControl.control.setValue({from, to});
        }
        this.writeValue(new FromToInput(from, to));
      }
    }
    this.parts.markAsTouched();
    this.checkValidators.next();
  };

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this.destroy.next(true);
    this.destroy.complete();
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  setPartsValidators(validators: ValidatorFn[]) {
    if (this.parts && this.ngControl?.control) {
      if (validators === null) {
        this.errorState = false;
      }
      this.ngControl.control.setValidators(validators);
      this.ngControl.control.updateValueAndValidity();
      this.parts.controls.from.setValidators(this.ngControl.control.validator);
      this.parts.controls.from.updateValueAndValidity();
      this.parts.controls.to.setValidators(this.ngControl.control.validator);
      this.parts.controls.to.updateValueAndValidity();
      this.checkValidators.next();
    }
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input')?.focus();
    }
  }

  writeValue(tel: FromToInput | null): void {
    this.value = tel;
    this.stateChanges.next();
  }

  registerOnChange(fn: any): void {
    if (this.ngControl) {
      // dont want formcontrol to overwrite our onchange. I see no problem with this solution so far
    } else {
      this.onChange = fn;
    }
  }

  registerOnTouched(fn: any): void {
    if (this.ngControl) {
      // dont want formcontrol to overwrite our ontouched. I see no problem with this solution so far
    } else {
      this.onTouched = fn;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(): void {
    this.onChange(this.parts.value);
  }

  ngOnInit(): void {
    if (this.ngControl) {
      if (this.ngControl?.control?.value) {
        this.parts = this.formBuilder.group({
          from: [this.ngControl.control.value.from, this.ngControl.control.validator],
          to: [this.ngControl.control.value.to, this.ngControl.control.validator]
        });
      } else { // just use formgroup validators instead?
        this.parts = this.formBuilder.group({
          from: [null, this.ngControl.control?.validator],
          to: [null, this.ngControl.control?.validator]
        });
      }
    }
    this.checkValidators.pipe(takeUntil(this.destroy)).subscribe(next => {
      if (this.ngControl && this.parts && this.parts.touched) {
        if (this.parts.controls.from.errors !== null) {
          this.ngControl.control?.setErrors(this.parts.controls.from.errors);
          this.errorState = true;
          this.stateChanges.next();
        } else if (this.parts.controls.to.errors !== null) {
          this.ngControl.control?.setErrors(this.parts.controls.to.errors);
          this.errorState = true;
          this.stateChanges.next();
        } else {
          this.ngControl.control?.setErrors(null);
          this.errorState = false;
          this.stateChanges.next();
        }
      }
    });

  }
}

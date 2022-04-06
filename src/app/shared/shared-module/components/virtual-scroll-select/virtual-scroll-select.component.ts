import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding, Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self, ViewChild
} from '@angular/core';
import {ScrollableDataSource} from '../../../ScrollableDataSource';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatSelect} from '@angular/material/select';

interface Task {
  id: number;
  description: string;
}

@Component({
  selector: 'app-virtual-scroll-select',
  templateUrl: './virtual-scroll-select.component.html',
  styleUrls: ['./virtual-scroll-select.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: VirtualScrollSelectComponent}],
})
export class VirtualScrollSelectComponent<T extends Task> implements ControlValueAccessor, MatFormFieldControl<T[] | T>, OnInit, OnDestroy {
  // tslint:disable:variable-name
  // tslint:disable:no-any
  @ViewChild('matSelectSearch') matSelectSearch: ElementRef;
  searchFocused = false;
  @ViewChild('select') selectCtrl: MatSelect;
  @Input() triggerAccessor = 'description';
  constructor(@Self() public ngControl: NgControl,
              private _elementRef: ElementRef<HTMLElement>,
              private _focusMonitor: FocusMonitor,
              @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField) {
    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
    if (this.ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      this.selectFormControl = new FormControl([], this.ngControl.validator);
      this.ngControl.valueAccessor = this;
    }
  }

  @Input()
  get value(): T[] | T {
    return this.selectFormControl.value;
  }

  set value(val: T[] | T | null) {
    this.selectFormControl.setValue(val || []);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.selectFormControl.disable() : this.selectFormControl.enable();
    this.stateChanges.next();
  }

  get empty(): boolean {
    return this.selectFormControl.value.length === 0;
  }

  get errorState(): boolean {
    return this.ngControl.errors !== null && !!this.ngControl.touched;
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(req: string | boolean) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  private _multiple = true;

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(mult: string | boolean) {
    this._multiple = coerceBooleanProperty(mult);
    this.stateChanges.next();
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    if (!this.selectCtrl) {
      return !this.empty;
    }
    return this.selectCtrl?.panelOpen || !this.empty || (this.focused && !!this._placeholder);
  }

  static nextId = 0;
  selectFormControl: FormControl;
  stateChanges = new Subject<void>();

  descriptionFilterControl: FormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject();
  @Input() scrollableDataSource: ScrollableDataSource<T>;
  readonly autofilled: boolean;
  controlType = 'virtual-scroll-select';
  private _disabled = false;
  focused = false;
  touched = false;

  @HostBinding() id = `virtual-scroll-select-${VirtualScrollSelectComponent.nextId++}`;

  private _placeholder: string;
  private _required = false;
  @Input('aria-describedby') userAriaDescribedBy: string;
  onChange = (_: any) => {
  };
  onTouched = () => {
  };


  idCompare = (o1: { id: number }, o2: { id: number }) => o1?.id === o2?.id;

  ngOnInit(): void {
    this.descriptionFilterControl.valueChanges
        .pipe(takeUntil(this.destroyed$), debounceTime(300), distinctUntilChanged())
        .subscribe((val) => {
          this.scrollableDataSource.filter(`&${this.triggerAccessor}=${val}`);
        });
    this.selectFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      this.onChange(val);
    });

  }

  onContainerClick(event: MouseEvent): void {

  }

  // for keyboard interaction leaves focus
  onSelectFocusLeave($event: unknown): void {
    if (!this.selectCtrl.panelOpen) {
      this.onTouched();
      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]): void {
    const controlElement = this._elementRef.nativeElement.querySelector('.virtual-scroll-select');
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(val: T[]): void {
    this.value = val;
  }

  selectOpenedChange($event: boolean): void {
    if (!$event) {
      this.onTouched();
      this.stateChanges.next();
    }
  }
}

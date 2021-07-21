import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional, Output,
  Self,
  ViewChild
} from '@angular/core';
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {ControlValueAccessor, FormBuilder, FormControl, NgControl} from '@angular/forms';
import {Field, Project, ProjectIndex} from '../../types/Project';
import {Lexicon} from '../../types/Lexicon';
import {Subject} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {takeUntil} from 'rxjs/operators';
import {UtilityFunctions} from '../../UtilityFunctions';
import {MatSelect, MatSelectChange} from '@angular/material/select';

@Component({
  selector: 'app-project-field-select',
  templateUrl: './project-field-select.component.html',
  styleUrls: ['./project-field-select.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: ProjectFieldSelectComponent}]
})
export class ProjectFieldSelectComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<string[]> {
  static nextId = 0;
  fieldFormControl: FormControl;
  currentProject: Project;
  lexicons: Lexicon[] = [];
  destroyed$: Subject<boolean> = new Subject();
  // tslint:disable-next-line:no-any
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter();
  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  stateChanges = new Subject<void>();
  @HostBinding() id = `project-field-select-${ProjectFieldSelectComponent.nextId++}`;
  focused = false;
  controlType = 'project-field-select';
  autofilled?: boolean | undefined;
  // tslint:disable-next-line:no-input-rename
  @Input('aria-describedby') userAriaDescribedBy: string;
  fieldsUnique: Field[] = [];
  @ViewChild('select') selectCtrl: MatSelect;
  fieldIndexMap: Map<string, string[]> = new Map<string, string[]>();

  constructor(private logService: LogService,
              private projectStore: ProjectStore,
              fb: FormBuilder, public fm: FocusMonitor, private elRef: ElementRef<HTMLElement>,
              // tslint:disable-next-line:variable-name
              @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
              @Self() public ngControl: NgControl) {
    fm.monitor(elRef, true).subscribe(origin => {
      if (!this.disabled) {
        if (!this.selectCtrl?.panelOpen) {
          this.focused = !!origin;
          this.stateChanges.next();
        }
      }
    });
    if (this.ngControl != null) {
      this.fieldFormControl = new FormControl([], this.ngControl.validator);
      this.ngControl.valueAccessor = this;
    }

  }

  get errorState(): boolean {
    return this.ngControl.errors !== null && !!this.ngControl.touched;
  }

  private _projectFields: ProjectIndex[];

  @Input() set projectFields(value: ProjectIndex[]) {
    if (value && value.length > 0) {
      this._projectFields = value;
      this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this._projectFields.map(x => x.fields).flat(), (x => x.path));
      // when changing indices remember selected fields only if they also exist in the new indices
      if (this.value) {
        this.value = this.value.filter(val => this.fieldsUnique.find(x => x.path === val));
      }
      this.fieldsUnique.push(this.fieldsUnique.splice(this.fieldsUnique.findIndex(x => x.type === 'fact'), 1)[0]);
      this.fieldIndexMap = ProjectIndex.getFieldToIndexMap(value);
      this.disabled = false;
    } else {
      this.value = [];
      this._projectFields = [];
      this.fieldsUnique = [];
      this.disabled = true;
    }
  }

  @Input()
  get value(): string[] | null {
    return this.fieldFormControl.value;
  }

  set value(fields: string[] | null) {
    this.fieldFormControl.setValue(fields);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return this.fieldFormControl?.value?.length === 0;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    if (!this.selectCtrl) {
      return false;
    }
    return this.selectCtrl?.panelOpen || !this.empty || (this.focused && !!this._placeholder);
  }

  private _required = false;

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  private _multiple = true;

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(mult) {
    this._multiple = coerceBooleanProperty(mult);
    this.stateChanges.next();
  }

  // tslint:disable-next-line:variable-name
  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.fieldFormControl.disable() : this.fieldFormControl.enable();
    this.stateChanges.next();
  }

  // tslint:disable-next-line:variable-name
  private _placeholder: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // tslint:disable-next-line:no-any
  onChange = (_: any) => {
  };

  onTouched = () => {
  };


  setDescribedByIds(ids: string[]): void {
    const controlElement = this.elRef.nativeElement.querySelector('.textarea-lexicon-input');
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
  }

  ngOnInit(): void {
    this.fieldFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(x => {
      this.onChange(this.value);
    });
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef);
  }

  // tslint:disable-next-line:no-any
  writeValue(obj: any): void {
    this.value = obj;
  }

  // tslint:disable-next-line:no-any
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // tslint:disable-next-line:no-any
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  selectBlur(event: boolean): void {
    if (!event) {
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
      this.openedChange.next(event);
    }
  }

  // for keyboard interaction leaves focus
  onSelectFocusLeave($event: unknown): void {
    if (!this.selectCtrl.panelOpen) {
      this.onTouched();
      this.stateChanges.next();
    }
  }
}

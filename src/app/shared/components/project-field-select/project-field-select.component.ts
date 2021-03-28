import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding, Inject,
  Input,
  OnDestroy,
  OnInit, Optional, Self,
  ViewChild
} from '@angular/core';
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {AbstractControl, ControlValueAccessor, FormBuilder, FormControl, NgControl} from '@angular/forms';
import {Field, Project, ProjectIndex} from '../../types/Project';
import {Lexicon} from '../../types/Lexicon';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../UtilityFunctions';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-project-field-select',
  templateUrl: './project-field-select.component.html',
  styleUrls: ['./project-field-select.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: ProjectFieldSelectComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFieldSelectComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<string[]> {
  static nextId = 0;
  fieldFormControl: FormControl = new FormControl([]);
  currentProject: Project;
  lexicons: Lexicon[] = [];
  destroyed$: Subject<boolean> = new Subject();
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

  constructor(private logService: LogService,
              private projectStore: ProjectStore,
              fb: FormBuilder, public fm: FocusMonitor, private elRef: ElementRef<HTMLElement>,
              // tslint:disable-next-line:variable-name
              @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
              @Self() public ngControl: NgControl) {
    fm.monitor(elRef, true).subscribe(origin => {
        this.focused = !!origin;
    });
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

  }

  // tslint:disable-next-line:typedef
  get errorState() {
    return this.ngControl.errors !== null && this.fieldFormControl.touched;
  }

  private _projectFields: ProjectIndex[];

  @Input() set projectFields(value: ProjectIndex[]) {
    if (value) {
      this._projectFields = ProjectIndex.sortTextaFactsAsFirstItem(value);
      this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this._projectFields.map(x => x.fields).flat(), (x => x.path));
    }
  }

  @Input()
  get value(): string[] | null {
    if (this.fieldFormControl.valid) {
      return this.fieldFormControl.value;
    }
    return null;
  }

  set value(stopWords: string[] | null) {
    this.fieldFormControl.setValue(stopWords);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return this.fieldFormControl.value.length === 0;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    if (!this.selectCtrl) {
      return false;
    }
    return this.selectCtrl?.panelOpen || !this.empty || (this.selectCtrl?.focused && !!this._placeholder);
  }

  private _required = false;

  @Input()
  get required() {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
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

  // tslint:disable-next-line:no-any
  onChange = (_: any) => {
  }

  onTouched = () => {
  }


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
      console.log('hmm');
      this.fieldFormControl.markAsTouched();
      this.onTouched();
      this.stateChanges.next();
    }
  }
}

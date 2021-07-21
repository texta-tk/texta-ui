import {
  ChangeDetectionStrategy,
  Component, ElementRef,
  HostBinding, Inject,
  Input,
  OnDestroy,
  OnInit, Optional,
  Self,
  ViewChild
} from '@angular/core';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../types/Project';
import {Lexicon} from '../../types/Lexicon';
import {MatMenuTrigger} from '@angular/material/menu';
import {AbstractControl, ControlValueAccessor, FormBuilder, FormControl, NgControl} from '@angular/forms';
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from '@angular/material/form-field';
import {FocusMonitor} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'app-textarea-lexicon',
  templateUrl: './textarea-lexicon.component.html',
  styleUrls: ['./textarea-lexicon.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: TextareaLexiconComponent}],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextareaLexiconComponent implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<string> {
  static nextId = 0;
  textareaFormControl: FormControl = new FormControl('');
  currentProject: Project;
  lexicons = new BehaviorSubject<Lexicon[]>([]);
  loadingLexicons = new BehaviorSubject(true);
  destroyed$: Subject<boolean> = new Subject();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  stateChanges = new Subject<void>();
  @HostBinding() id = `textarea-lexicon-input-${TextareaLexiconComponent.nextId++}`;
  focused = false;
  errorState = false;
  controlType = 'textarea-lexicon-input';
  autofilled?: boolean | undefined;
  // tslint:disable-next-line:no-input-rename
  @Input('aria-describedby') userAriaDescribedBy: string;

  constructor(private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore,
              fb: FormBuilder, private fm: FocusMonitor, private elRef: ElementRef<HTMLElement>,
              // tslint:disable-next-line:variable-name
              @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
              @Self() public ngControl: NgControl) {
    fm.monitor(elRef, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

  }

  @Input()
  get value(): string | null {
    if (this.textareaFormControl.valid) {
      return this.textareaFormControl.value;
    }
    return null;
  }

  set value(stopWords: string | null) {
    this.textareaFormControl.setValue(stopWords);
    this.stateChanges.next();
  }

  get empty(): boolean {
    return !this.textareaFormControl.value;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat(): boolean {
    return this.focused || !this.empty;
  }

  // tslint:disable-next-line:variable-name
  private _required = false;

  @Input()
  get required(): boolean {
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
    this._disabled ? this.textareaFormControl.disable() : this.textareaFormControl.enable();
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
  };

  onTouched = () => {
  };

  setDescribedByIds(ids: string[]): void {
    const controlElement = this.elRef.nativeElement.querySelector('.textarea-lexicon-input');
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this.elRef.nativeElement.querySelector('input')?.focus();
    }
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      this.loadingLexicons.next(false);
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.lexicons.next(resp.results);
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  public addLexicon(val: Lexicon, control: AbstractControl): void {
    if (control) {
      const formControlValue = control.value as string;
      let phrases = '';
      if (val.positives_used || val.positives_unused) {
        val.positives_used.forEach(x => {
          phrases += x + '\n';
        });
        val.positives_unused.forEach(x => {
          phrases += x + '\n';
        });
      }
      if (formControlValue.endsWith('\n') || formControlValue === '') {
        this.writeValue(formControlValue + phrases);
      } else {
        this.writeValue(formControlValue + '\n' + phrases);
      }
    }
    this.onChange(this.value);
    this.trigger.closeMenu();
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

  _handleInput(): void {
    this.onChange(this.value);
  }
}

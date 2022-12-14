import {AfterViewInit, Component, Host, Input, OnDestroy} from '@angular/core';
import {MatPseudoCheckboxState} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'app-mat-option-select-all',
  template: `
    <div class="mat-option" data-cy="matOptionSelectAll" (click)="onSelectAllClick($event)" *ngIf="multiple">
      <mat-pseudo-checkbox [state]="state" class="mat-option-pseudo-checkbox"></mat-pseudo-checkbox>
      <span class="mat-option-text">Select all</span>
    </div>
  `,
  styles: [`
    .mat-option {
      border-bottom: 1px solid #ccc;
      height: 3.5em;
      line-height: 3.5em;
    }`]
})
export class MatOptionSelectAllComponent implements AfterViewInit, OnDestroy {

  state: MatPseudoCheckboxState = 'checked';
  private options: unknown[] = [];
  private value: unknown[] | null = [];

  private destroyed = new Subject();

  private _multiple = true;

  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(mult) {
    this._multiple = coerceBooleanProperty(mult);
  }

  constructor(@Host() private matSelect: MatSelect) {
  }

  ngAfterViewInit(): void {
    if (this.matSelect && this.matSelect.ngControl && this.matSelect.ngControl.control && this.matSelect.options) {
      this.options = this.matSelect.options.map(x => x.value);
      this.matSelect.options.changes
        .pipe(takeUntil(this.destroyed))
        .subscribe(res => {
          this.options = this.matSelect.options.map(x => x.value);
          this.updateState();
        });

      this.value = this.matSelect.ngControl.control.value;
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.matSelect!.ngControl!.valueChanges!
        .pipe(takeUntil(this.destroyed))
        .subscribe(res => {
          this.value = res;
          this.updateState();
        });
      // ExpressionChangedAfterItHasBeenCheckedError fix...
      setTimeout(() => {
        this.updateState();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next(true);
    this.destroyed.complete();
  }

  onSelectAllClick(evt: MouseEvent): void {
    if (this.state === 'checked') {
      if (this.matSelect?.ngControl?.control) {
        this.matSelect.ngControl.control.setValue([]);
      }
    } else {
      if (this.matSelect?.ngControl?.control) {
        this.matSelect.ngControl.control.setValue(this.options);
      }
    }

  }

  private updateState(): void {
    const areAllSelected = this.areArraysEqual(this.value, this.options);
    if (areAllSelected) {
      this.state = 'checked';
    } else if (this.value && this.value.length > 0) {
      this.state = 'indeterminate';
    } else {
      this.state = 'unchecked';
    }
  }

  private areArraysEqual(a: unknown[] | null, b: unknown[]): boolean {
    return [...a || []].sort().join(',') === [...b].sort().join(',');
  }

}

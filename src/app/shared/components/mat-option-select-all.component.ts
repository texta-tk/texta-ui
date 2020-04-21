import {Component, OnInit, Host, AfterViewInit, OnDestroy} from '@angular/core';
import {MatPseudoCheckboxState} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-mat-option-select-all',
  template: `
    <div class="mat-option" data-cy="matOptionSelectAll" (click)="onSelectAllClick($event)">
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
  private options: any[] = [];
  private value: any[] | null = [];

  private destroyed = new Subject();

  constructor(@Host() private matSelect: MatSelect) {
  }

  ngAfterViewInit() {
    if (this.matSelect && this.matSelect.ngControl && this.matSelect.ngControl.control) {
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

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onSelectAllClick(evt: MouseEvent) {
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

  private updateState() {
    const areAllSelected = this.areArraysEqual(this.value, this.options);
    if (areAllSelected) {
      this.state = 'checked';
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
    } else if (this.value!.length > 0) {
      this.state = 'indeterminate';
    } else {
      this.state = 'unchecked';
    }
  }

  private areArraysEqual(a, b) {
    return [...a].sort().join(',') === [...b].sort().join(',');
  }

}

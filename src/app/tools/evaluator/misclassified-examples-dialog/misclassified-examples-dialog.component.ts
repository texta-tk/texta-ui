import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';
import {EvaluatorMisclassifiedExamplesResults, IndividualResults} from '../../../shared/types/tasks/Evaluator';
import {MatSort} from '@angular/material/sort';
import {UntypedFormBuilder} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {debounceTime, switchMap} from 'rxjs/operators';
import {ConfusionMatrixDialogComponent} from '../../../shared/plotly-module/confusion-matrix-dialog/confusion-matrix-dialog.component';
import {AddLexiconDialogComponent} from '../../../shared/shared-module/components/dialogs/add-lexicon-dialog/add-lexicon-dialog.component';

interface OnSubmitParams {
  minCount: number;
  maxCount: number;
  topN: string;
}

@Component({
  selector: 'app-misclassified-examples-dialog',
  templateUrl: './misclassified-examples-dialog.component.html',
  styleUrls: ['./misclassified-examples-dialog.component.scss']
})
export class MisclassifiedExamplesDialogComponent {

  @ViewChild(MatSort) sort: MatSort;
  public isLoadingResults = false;
  public totalResults = 0;

  paramForm = this.fb.group({
    minCount: [''],
    maxCount: [''],
    topN: [''],
  });

  appliedParams: Partial<{
    min_count: number,
    max_count: number,
    top_n: string
  }> | undefined = undefined;

  results: EvaluatorMisclassifiedExamplesResults | undefined;
  featureType: keyof EvaluatorMisclassifiedExamplesResults = 'false_positives';
  viewType: 'list' | 'table' = 'list';

  constructor(
    private logService: LogService, private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private evaluatorService: EvaluatorService,
    @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, evaluatorId: number; }) {
    if (this.data) {
      this.onSubmit(this.paramForm.value);
    }
  }

  onSubmit(value: OnSubmitParams): void {
    this.isLoadingResults = true;
    const body = {
      ...value.topN ? {top_n: value.topN} : {},
      ...value.maxCount ? {max_count: value.maxCount} : {},
      ...value.minCount ? {min_count: value.minCount} : {},
    };
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.postEvaluatorMisclassifiedExamples(this.data.currentProjectId, this.data.evaluatorId, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.results = x;
        } else {
          this.logService.snackBarError(x);
        }
        this.isLoadingResults = false;
      });
    }
  }

  // tslint:disable-next-line:no-any
  openLexiconDialog(selected: any[]): void {
    if (selected) {
      this.dialog.open(AddLexiconDialogComponent, {
        maxHeight: '90vh',
        width: '800px',
        disableClose: true,
        data: selected.map(x => {
          if (typeof x.value === 'object') {
            return x.value.pred;
          }
          return x.value;
        })
      });
    }
  }
}

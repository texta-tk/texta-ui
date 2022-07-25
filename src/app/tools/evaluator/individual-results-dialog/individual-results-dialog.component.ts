import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../../core/util/log.service';
import {EvaluatorIndividualResults, IndividualResults} from '../../../shared/types/tasks/Evaluator';
import {HttpErrorResponse} from '@angular/common/http';
import {UntypedFormBuilder} from '@angular/forms';
import {debounceTime, delay, switchMap} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {ConfusionMatrixDialogComponent} from '../../../shared/plotly-module/confusion-matrix-dialog/confusion-matrix-dialog.component';

interface OnSubmitParams {
  minCount: number;
  maxCount: number;
  metricRestrictions: string;
}

@Component({
  selector: 'app-individual-results-dialog',
  templateUrl: './individual-results-dialog.component.html',
  styleUrls: ['./individual-results-dialog.component.scss']
})
export class IndividualResultsDialogComponent implements OnInit, AfterViewInit {
  tableData: MatTableDataSource<{ name: string } & IndividualResults> = new MatTableDataSource();
  // name matches backend name to sort easier
  displayedColumns: string[] = ['alphabetic', 'precision', 'recall', 'f1_score', 'accuracy', 'count', 'conf_matrix'];
  @ViewChild(MatSort) sort: MatSort;
  public isLoadingResults = true;
  public totalResults = 0;
  paramForm = this.fb.group({
    minCount: [''],
    maxCount: [''],
    metricRestrictions: [''],
  });
  appliedParams: Partial<{
    min_count: number,
    max_count: number,
    metric_restrictions: string
  }> | undefined = undefined;

  constructor(
    private logService: LogService, private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private evaluatorService: EvaluatorService,
    @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, evaluatorId: number; }) {
  }

  ngOnInit(): void {
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.evaluatorIndividualResults(this.data.currentProjectId, this.data.evaluatorId, {}).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.tableData.data = Object.keys(x.filtered_results).map(k => ({name: k, ...x.filtered_results[k]}));
          this.totalResults = x.total;
        } else {
          this.logService.snackBarError(x);
        }
        this.isLoadingResults = false;
      });
    }
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.pipe(debounceTime(1000), switchMap(sort => {
      this.isLoadingResults = true;
      const body = {
        ...this.appliedParams ? this.appliedParams : {},
        order_by: this.sort.active,
        order_desc: this.sort.direction === 'desc'
      };
      return this.evaluatorService.evaluatorIndividualResults(this.data.currentProjectId, this.data.evaluatorId, body);
    })).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.tableData.data = Object.keys(x.filtered_results).map(k => ({name: k, ...x.filtered_results[k]}));
        this.totalResults = x.total;
      } else {
        this.logService.snackBarError(x);
      }
      this.isLoadingResults = false;
    });
  }

  onSubmit(value: OnSubmitParams): void {
    this.isLoadingResults = true;
    this.appliedParams = {
      ...value.metricRestrictions ? {metric_restrictions: value.metricRestrictions} : {},
      ...value.maxCount ? {max_count: value.maxCount} : {},
      ...value.minCount ? {min_count: value.minCount} : {},
    };
    const body = {
      ...this.appliedParams ? this.appliedParams : {},
      order_by: this.sort.active,
      order_desc: this.sort.direction === 'desc'
    };
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.evaluatorIndividualResults(this.data.currentProjectId, this.data.evaluatorId, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.tableData.data = Object.keys(x.filtered_results).map(k => ({name: k, ...x.filtered_results[k]}));
          this.totalResults = x.total;
        } else {
          this.logService.snackBarError(x);
        }
        this.isLoadingResults = false;
      });
    }
  }

  openConfMatrix(element: IndividualResults): void {
    const parsed = element.confusion_matrix;
    if (parsed && parsed.length > 0) {
      this.dialog.open(ConfusionMatrixDialogComponent, {
        height: parsed[0].length > 2 ? '90vh' : '800px',
        width: parsed[0].length > 2 ? '90vw' : '800px',
        data: {confusion_matrix: element.confusion_matrix, classes: ['true', 'false']},
      });
    } else {
      this.logService.snackBarMessage('Confusion matrix is empty!', 2000);
    }
  }
}

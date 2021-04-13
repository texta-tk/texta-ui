import {Component, Inject, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from "@angular/common/http";
import {FormControl} from "@angular/forms";

@Component({
  selector: 'app-filtered-average-dialog',
  templateUrl: './filtered-average-dialog.component.html',
  styleUrls: ['./filtered-average-dialog.component.scss']
})
export class FilteredAverageDialogComponent implements OnInit {
  result: {
    precision: number;
    recall: number;
    f1_score: number;
    accuracy: number;
    count: number;
  } = {precision: 0, recall: 0, f1_score: 0, accuracy: 0, count: 0};
  model: {
    precision: { min_score: number, max_score: number },
    recall: { min_score: number, max_score: number }
    f1_score: { min_score: number, max_score: number }
    accuracy: { min_score: number, max_score: number }
  } = {
    precision: {min_score: 0, max_score: 1},
    recall: {min_score: 0, max_score: 1},
    f1_score: {min_score: 0, max_score: 1},
    accuracy: {min_score: 0, max_score: 1},
  };
  minCountFormControl = new FormControl(1);
  maxCountFormControl = new FormControl();

  constructor(
    private logService: LogService,
    private evaluatorService: EvaluatorService,
    @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, evaluatorId: number; }) {
  }

  ngOnInit(): void {
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.evaluatorFilteredAverage(this.data.currentProjectId, this.data.evaluatorId, {}).subscribe(x => {
        if (!(x instanceof HttpErrorResponse)) {
          this.result = x;
        }
      });
    }
  }

  getNewAvgScore(): void {
    if (this.data.evaluatorId && this.data.currentProjectId) {
      const body = {
        metric_restrictions: this.model,
        ...this.minCountFormControl.value ? {min_count: this.minCountFormControl.value} : {},
        ...this.maxCountFormControl.value ? {max_count: this.maxCountFormControl.value} : {},
      };
      this.evaluatorService.evaluatorFilteredAverage(this.data.currentProjectId, this.data.evaluatorId, body).subscribe(x => {
        if (!(x instanceof HttpErrorResponse)) {
          this.result = x;
        }
      });
    }
  }
}

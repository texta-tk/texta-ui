import {Component, Inject, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-misclassified-examples-dialog',
  templateUrl: './misclassified-examples-dialog.component.html',
  styleUrls: ['./misclassified-examples-dialog.component.scss']
})
export class MisclassifiedExamplesDialogComponent implements OnInit {
  results: unknown;
  constructor(
    private logService: LogService,
    private evaluatorService: EvaluatorService,
    @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, evaluatorId: number; }) {
  }

  ngOnInit(): void {
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.getEvaluatorMisclassifiedExamples(this.data.currentProjectId, this.data.evaluatorId).subscribe(x => {
        this.results = x;
      });
    }
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-individual-results-dialog',
  templateUrl: './individual-results-dialog.component.html',
  styleUrls: ['./individual-results-dialog.component.scss']
})
export class IndividualResultsDialogComponent implements OnInit {
  results: unknown;
  constructor(
    private logService: LogService,
    private evaluatorService: EvaluatorService,
    @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, evaluatorId: number; }) {
  }

  ngOnInit(): void {
    if (this.data.evaluatorId && this.data.currentProjectId) {
      this.evaluatorService.evaluatorIndividualResults(this.data.currentProjectId, this.data.evaluatorId, {}).subscribe(x => {
        this.results = x;
      });
    }
  }

}

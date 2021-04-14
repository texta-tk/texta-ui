import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Evaluator} from '../../../shared/types/tasks/Evaluator';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-edit-evaluator-dialog',
  templateUrl: './edit-evaluator-dialog.component.html',
  styleUrls: ['./edit-evaluator-dialog.component.scss']
})
export class EditEvaluatorDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditEvaluatorDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Evaluator,
              private evaluatorService: EvaluatorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    console.log(this.data);
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.evaluatorService.editEvaluator({description: this.data.description}, project.id, this.data.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

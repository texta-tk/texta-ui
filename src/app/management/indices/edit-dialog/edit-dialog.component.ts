import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Evaluator} from '../../../shared/types/tasks/Evaluator';
import {EvaluatorService} from '../../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Index} from '../../../shared/types/Index';
import {CoreService} from '../../../core/core.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-dialog.component.html',
  styleUrls: ['./edit-dialog.component.scss']
})
export class EditDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  tableData: Index;
  domains: { display_name: string, value: string }[] = [];

  constructor(private dialogRef: MatDialogRef<EditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Index,
              private coreService: CoreService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.tableData = {...this.data};
    this.coreService.getElasticIndicesOptions().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        // @ts-ignore
        this.domains = resp.actions.POST.domain.choices || [];
      }
    });
  }

  onSubmit(): void {
    this.coreService.editElasticIndex(this.tableData).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(resp.message, 5000);
        for (const key in this.data) {
          if (this.data.hasOwnProperty(key) && key !== 'id' && this.tableData.hasOwnProperty(key)) {
            // @ts-ignore
            this.data[key] = this.tableData[key];
          }
        }
        this.dialogRef.close(this.data);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

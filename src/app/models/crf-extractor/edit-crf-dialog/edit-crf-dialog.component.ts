import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {CRFExtractor} from '../../../shared/types/tasks/CRFExtractor';
import {CRFExtractorService} from '../../../core/models/crf-extractor/crf-extractor.service';

@Component({
  selector: 'app-edit-dialog',
  templateUrl: './edit-crf-dialog.component.html',
  styleUrls: ['./edit-crf-dialog.component.scss']
})
export class EditCrfDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditCrfDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: CRFExtractor,
              private crfExtractorService: CRFExtractorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.crfExtractorService.editCRFExtractorTask({description: this.data.description}, project.id, this.data.id);
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

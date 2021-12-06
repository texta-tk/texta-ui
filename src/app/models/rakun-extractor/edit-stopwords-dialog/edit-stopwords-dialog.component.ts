import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {RakunExtractorService} from '../../../core/models/rakun-extractor/rakun-extractor.service';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-edit-stopwords-dialog',
  templateUrl: './edit-stopwords-dialog.component.html',
  styleUrls: ['./edit-stopwords-dialog.component.scss']
})
export class EditStopwordsDialogComponent  implements OnInit, OnDestroy {
  stopWordsFormControl = new FormControl('');
  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  stopwordsOptions: any;
  overWriteExisting = true;

  constructor(private dialogRef: MatDialogRef<EditStopwordsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, rakunId: number; },
              private rakunExtractorService: RakunExtractorService,
              private logService: LogService) {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.rakunExtractorService.getStopWords(this.data.currentProjectId,
      this.data.rakunId).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.stopWordsFormControl.setValue(resp.stopwords.join('\n'));
      } else {
        this.logService.snackBarError(resp, 4000);
      }
    });

    this.rakunExtractorService.getStopWordsOptions(this.data.currentProjectId, this.data.rakunId).pipe(
      takeUntil(this.destroyed$)).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.stopwordsOptions = options;
      }
    });
  }

  onSubmit(): void {
    this.rakunExtractorService.postStopWords(this.data.currentProjectId, this.data.rakunId,
      {
        stopwords: this.stopWordsFormControl.value.split('\n').filter((x: string) => !!x),
        overwrite_existing: this.overWriteExisting
      })
      .subscribe((resp: { 'stopwords': string } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage('Successfully saved stop words!', 3000);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

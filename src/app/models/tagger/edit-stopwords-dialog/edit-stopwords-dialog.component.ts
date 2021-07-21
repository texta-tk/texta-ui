import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl} from '@angular/forms';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';

@Component({
  selector: 'app-edit-stopwords-dialog',
  templateUrl: './edit-stopwords-dialog.component.html',
  styleUrls: ['./edit-stopwords-dialog.component.scss']
})
export class EditStopwordsDialogComponent implements OnInit, OnDestroy {
  stopWordsFormControl = new FormControl('');
  ignoreNumbersFormControl: FormControl;
  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  stopwordsOptions: any;

  constructor(private dialogRef: MatDialogRef<EditStopwordsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; ignore_numbers: boolean | null },
              private taggerService: TaggerService,
              private logService: LogService) {
    this.ignoreNumbersFormControl = new FormControl(!!data.ignore_numbers);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.taggerService.getStopWords(this.data.currentProjectId,
      this.data.taggerId).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.stopWordsFormControl.setValue(resp.stop_words.join('\n'));
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
    });
    this.taggerService.getStopWordsOptions(this.data.currentProjectId, this.data.taggerId).pipe(
      takeUntil(this.destroyed$)).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.stopwordsOptions = options;
      }
    });
  }

  onSubmit(): void {
    this.taggerService.postStopWords(this.data.currentProjectId, this.data.taggerId,
      {
        stop_words: this.stopWordsFormControl.value.split('\n').filter((x: string) => !!x),
        ignore_numbers: this.ignoreNumbersFormControl.value
      })
      .subscribe((resp: { 'stop_words': string } | HttpErrorResponse) => {
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

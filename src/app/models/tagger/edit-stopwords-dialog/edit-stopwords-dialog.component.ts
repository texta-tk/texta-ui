import {Component, OnInit, Inject} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-stopwords-dialog',
  templateUrl: './edit-stopwords-dialog.component.html',
  styleUrls: ['./edit-stopwords-dialog.component.scss']
})
export class EditStopwordsDialogComponent implements OnInit {
  stopwords: string;

  constructor(private dialogRef: MatDialogRef<EditStopwordsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number;},
              private taggerService: TaggerService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.taggerService.getStopWords(this.data.currentProjectId, this.data.taggerId).subscribe((resp: {'stop_words': string} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.stopwords = resp.stop_words;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
    });
  }

  onSubmit() {
    this.taggerService.postStopWords(this.data.currentProjectId, this.data.taggerId, {text: this.stopwords})
    .subscribe((resp: {'stop_words': string} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.stopwords = resp.stop_words;
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

import {Component, Inject, OnInit} from '@angular/core';
import {ListFeaturesResponse} from 'src/app/shared/types/tasks/Tagger';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TaggerService} from 'src/app/core/models/taggers/tagger.service';
import {LogService} from 'src/app/core/util/log.service';
import {AddLexiconDialogComponent} from '../../../shared/components/dialogs/add-lexicon-dialog/add-lexicon-dialog.component';

@Component({
  selector: 'app-list-features-dialog',
  templateUrl: './list-features-dialog.component.html',
  styleUrls: ['./list-features-dialog.component.scss']
})
export class ListFeaturesDialogComponent implements OnInit {
  result: ListFeaturesResponse;
  size = 100;
  isLoading: boolean;
  selectedOptions: string[] = [];

  constructor(private dialogRef: MatDialogRef<ListFeaturesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number },
              private taggerService: TaggerService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.fetchFeatures(this.size);
    this.taggerService.getStopWords(this.data.currentProjectId, this.data.taggerId).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.selectedOptions = resp.stop_words;
      } else {
        this.logService.snackBarError(resp);
      }
    });
  }

  fetchFeatures(size: number): void {
    this.isLoading = true;
    this.taggerService.listFeatures(this.data.currentProjectId,
      this.data.taggerId, size).subscribe((resp: ListFeaturesResponse | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
      this.isLoading = false;
    });
  }

  addStopWords(selectedOptions: string[]): void {
    this.isLoading = true;
    this.taggerService.postStopWords(this.data.currentProjectId, this.data.taggerId, {
      stop_words: selectedOptions,
      overwrite_existing: false
    }).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage('Successfully added stop words!', 3000);
      } else if (resp) {
        this.logService.snackBarError(resp, 4000);
      }
      this.isLoading = false;
    });
  }

  addToLexicon(selectedOptions: string[]): void {
    this.dialog.open(AddLexiconDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      data: selectedOptions
    });
  }
}

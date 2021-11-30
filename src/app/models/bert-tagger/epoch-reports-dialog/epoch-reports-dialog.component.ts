import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {BertEpochReport} from '../../../shared/types/tasks/BertTagger';

@Component({
  selector: 'app-epoch-reports-dialog',
  templateUrl: './epoch-reports-dialog.component.html',
  styleUrls: ['./epoch-reports-dialog.component.scss']
})
export class EpochReportsDialogComponent implements OnInit {
  isLoadingResults = true;
  result: BertEpochReport[];

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {

  }

  ngOnInit(): void {

    this.bertTaggerService.bertEpochReport(this.data.currentProjectId, this.data.taggerId).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else {
        this.isLoadingResults = false;
        this.result = resp;
      }
    });

  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-epoch-reports-dialog',
  templateUrl: './epoch-reports-dialog.component.html',
  styleUrls: ['./epoch-reports-dialog.component.scss']
})
export class EpochReportsDialogComponent implements OnInit {

  result: unknown;

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  ngOnInit(): void {
    this.bertTaggerService.bertEpochReport(this.data.currentProjectId, this.data.taggerId).subscribe(x => {
      if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x);
      } else {
        this.result = x;
      }
    });

  }

}

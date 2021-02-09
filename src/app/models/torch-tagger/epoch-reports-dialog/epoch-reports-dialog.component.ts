import {Component, Inject, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';

@Component({
  selector: 'app-epoch-reports-dialog',
  templateUrl: './epoch-reports-dialog.component.html',
  styleUrls: ['./epoch-reports-dialog.component.scss']
})
export class EpochReportsDialogComponent implements OnInit {

  result: unknown;

  constructor(private torchTaggerService: TorchTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  ngOnInit(): void {
    this.torchTaggerService.torchEpochReport(this.data.currentProjectId, this.data.taggerId).subscribe(x => {
      if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x);
      } else {
        this.result = x;
      }
    });

  }
}

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
  isLoadingResults = true;
  result: { validation_loss: number, accuracy: number, training_loss: number, epoch: number }[];

  constructor(private torchTaggerService: TorchTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  ngOnInit(): void {
    this.torchTaggerService.torchEpochReport(this.data.currentProjectId, this.data.taggerId).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else {
        this.isLoadingResults = false;
        this.result = resp.flatMap((x, index) => [{
          validation_loss: x.val_loss,
          training_loss: x.training_loss,
          accuracy: x.accuracy,
          epoch: index
        }]);
      }
    });

  }
}

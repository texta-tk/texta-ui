import {Component, Inject, OnInit} from '@angular/core';
import {ListFeaturesResponse} from 'src/app/shared/types/tasks/Tagger';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaggerService} from 'src/app/core/models/taggers/tagger.service';
import {LogService} from 'src/app/core/util/log.service';

@Component({
  selector: 'app-list-features-dialog',
  templateUrl: './list-features-dialog.component.html',
  styleUrls: ['./list-features-dialog.component.scss']
})
export class ListFeaturesDialogComponent implements OnInit {
  result: ListFeaturesResponse;

  constructor(private dialogRef: MatDialogRef<ListFeaturesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; },
              private taggerService: TaggerService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.taggerService.listFeatures(this.data.currentProjectId,
      this.data.taggerId).subscribe((resp: ListFeaturesResponse | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
    });
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {CRFExtractorService} from '../../../core/models/crf-extractor/crf-extractor.service';
import {CRFFeature, CRFListFeatures} from '../../../shared/types/tasks/CRFExtractor';

@Component({
  selector: 'app-list-features-dialog',
  templateUrl: './list-features-dialog.component.html',
  styleUrls: ['./list-features-dialog.component.scss']
})
export class ListFeaturesDialogComponent implements OnInit {
  result: CRFListFeatures;
  responseSize = 0;
  responseTotalSize = 0;
  isLoading: boolean;
  featureType: 'positive' | 'negative' = 'positive';

  constructor(private dialogRef: MatDialogRef<ListFeaturesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, elementId: number },
              private crfExtractorService: CRFExtractorService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.fetchFeatures();
  }

  fetchFeatures(): void {
    this.isLoading = true;
    this.crfExtractorService.listCRFFeatures(this.data.currentProjectId,
      this.data.elementId).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
        this.responseSize = resp.showing_features;
        this.responseTotalSize = resp.total_features;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
      this.isLoading = false;
    });
  }

}

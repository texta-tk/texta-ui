import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ClusterService} from '../../../../core/models/clusters/cluster.service';
import {Cluster} from '../../../../shared/types/tasks/Cluster';

@Component({
  selector: 'app-edit-stopwords-dialog',
  templateUrl: './edit-stopwords-dialog.component.html',
  styleUrls: ['./edit-stopwords-dialog.component.scss']
})
export class EditStopwordsDialogComponent implements OnInit {
  stopwords: string;

  constructor(private dialogRef: MatDialogRef<EditStopwordsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, cluster: Cluster; },
              private clusterService: ClusterService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    if (this.data?.cluster?.stop_words) {
      this.stopwords = this.data.cluster.stop_words.join('\n');
    }
  }


  onSubmit(): void {
    const body = {
      stop_words: this.stopwords ? this.stopwords.split('\n') : []
    };
    this.clusterService.editCluster(this.data.currentProjectId, this.data.cluster.id, body)
      .subscribe((resp: Cluster | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage('Successfully saved stop words!', 3000);
          this.dialogRef.close();
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
      });
  }
}

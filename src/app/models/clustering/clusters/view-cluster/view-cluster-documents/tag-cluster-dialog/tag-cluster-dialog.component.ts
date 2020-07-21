import {Component, Inject, OnInit} from '@angular/core';
import {ClusterService} from '../../../../../../core/models/clusters/cluster.service';
import {LogService} from '../../../../../../core/util/log.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../../../shared/CustomerErrorStateMatchers';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-tag-cluster-dialog',
  templateUrl: './tag-cluster-dialog.component.html',
  styleUrls: ['./tag-cluster-dialog.component.scss']
})
export class TagClusterDialogComponent implements OnInit {
  tagForm = new FormGroup({
    nameFormControl: new FormControl('', [Validators.required]),
    strValFormControl: new FormControl('', [Validators.required]),
    docPathFormControl: new FormControl('', [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private clusterService: ClusterService, private logService: LogService,
              private dialogRef: MatDialogRef<TagClusterDialogComponent>,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: { clusterId: number, clusteringId: number, projectId: number; }) {
  }

  ngOnInit(): void {
  }

  onSubmit(formData: { nameFormControl: string; strValFormControl: string; docPathFormControl: string; }) {
    const body = {
      fact: formData.nameFormControl,
      str_val: formData.strValFormControl,
      doc_path: formData.docPathFormControl
    };
    this.clusterService.tagCluster(this.data.projectId, this.data.clusteringId, this.data.clusterId, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage('Fact added.', 2000);
        this.dialogRef.close();
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 4000);
      }
    });
  }
}

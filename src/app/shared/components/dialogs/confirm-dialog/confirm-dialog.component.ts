import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  confirmText = 'Continue';
  cancelText = 'Cancel';
  mainText = 'Are you sure?';
  title = 'Unsaved Progress';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmText: string, cancelText: string, mainText: string, title: string }) {
    this.confirmText = data.confirmText;
    this.cancelText = data.cancelText;
    this.mainText = data.mainText;
    this.title = data.title;

  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close({action: false});
  }

  closeDialogConfirm() {
    this.dialogRef.close({action: true});
  }
}

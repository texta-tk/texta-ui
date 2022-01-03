import {Component, Inject, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-bulk-delete-dialog.component.html',
  styleUrls: ['./confirm-bulk-delete-dialog.component.scss']
})
export class ConfirmBulkDeleteDialogComponent implements OnInit {
  confirmText = 'Continue';
  cancelText = 'Cancel';
  mainText = 'Unsaved progress';
  title = 'Are you sure?';
  confirmBtnColor: ThemePalette = 'warn';

  constructor(
    public dialogRef: MatDialogRef<ConfirmBulkDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmText: string, cancelText: string,
      mainText: string, title: string, confirmBtnColor: ThemePalette, items: string[] }) {
    this.confirmText = data.confirmText ? data.confirmText : this.confirmText;
    this.cancelText = data.cancelText ? data.cancelText : this.cancelText;
    this.mainText = data.mainText ? data.mainText : this.mainText;
    this.title = data.title ? data.title : this.title;
    this.confirmBtnColor = data.confirmBtnColor ? data.confirmBtnColor : this.confirmBtnColor;
  }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  closeDialogConfirm(): void {
    this.dialogRef.close(true);
  }
}

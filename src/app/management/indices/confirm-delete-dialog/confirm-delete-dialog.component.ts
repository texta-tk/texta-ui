import {Component, Inject, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Index} from '../../../shared/types/Index';

@Component({
  selector: 'app-confirm-delete-dialog',
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.scss']
})
export class ConfirmDeleteDialogComponent implements OnInit {
  confirmText = 'Continue';
  cancelText = 'Cancel';
  mainText = 'Unsaved progress';
  title = 'Are you sure?';
  confirmBtnColor: ThemePalette = 'warn';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { confirmText: string, cancelText: string,
      mainText: string, title: string, confirmBtnColor: ThemePalette, indices: Index[] }) {
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

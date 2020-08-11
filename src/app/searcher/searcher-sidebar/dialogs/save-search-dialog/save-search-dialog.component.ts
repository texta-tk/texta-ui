import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-save-search-dialog',
  templateUrl: './save-search-dialog.component.html',
  styleUrls: ['./save-search-dialog.component.scss']
})
export class SaveSearchDialogComponent {
  saveSearchForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
  });

  constructor(private dialogRef: MatDialogRef<SaveSearchDialogComponent>) {
  }

  onSubmit(value: { descriptionFormControl: string; }): void {
    this.dialogRef.close(value.descriptionFormControl);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

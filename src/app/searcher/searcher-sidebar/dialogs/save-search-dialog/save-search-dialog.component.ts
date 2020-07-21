import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../../core/projects/project.store';
import {LogService} from '../../../../core/util/log.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-save-search-dialog',
  templateUrl: './save-search-dialog.component.html',
  styleUrls: ['./save-search-dialog.component.scss']
})
export class SaveSearchDialogComponent implements OnInit {
  saveSearchForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
  });

  constructor(private dialogRef: MatDialogRef<SaveSearchDialogComponent>,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
  }

  onSubmit(value: { descriptionFormControl: string; }) {
    this.dialogRef.close(value.descriptionFormControl);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../../core/projects/project.store';

@Component({
  selector: 'app-project-guard-dialog',
  templateUrl: './project-guard-dialog.component.html',
  styleUrls: ['./project-guard-dialog.component.scss']
})
export class ProjectGuardDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ProjectGuardDialogComponent>,
    private projectStore: ProjectStore) {
  }

  ngOnInit(): void {

  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}

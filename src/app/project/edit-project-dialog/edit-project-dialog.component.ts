import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {ProjectService} from '../../core/projects/project.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';

@Component({
  selector: 'app-edit-project-dialog',
  templateUrl: './edit-project-dialog.component.html',
  styleUrls: ['./edit-project-dialog.component.scss']
})
export class EditProjectDialogComponent implements OnInit {

  indices: string[] = [];
  projectForm = new FormGroup({
    indicesFormControl: new FormControl([], Validators.required)
  });

  constructor(public dialogRef: MatDialogRef<EditProjectDialogComponent>,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: Project,
              private projectStore: ProjectStore,
              private projectService: ProjectService) {
    this.projectForm.get('indicesFormControl').setValue(this.data.indices);
  }

  ngOnInit() {
    this.projectService.getProjectOptions().subscribe(resp => {
      this.indices = resp.actions.POST.indices.choices;
    });


  }

  onSubmit(formData) {
    this.data.indices = formData.indicesFormControl;
    this.projectService.editProject(this.data, this.data.id).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else if (resp) {
        this.projectStore.refreshProjects();
        this.dialogRef.close();
      }
    });
  }

}

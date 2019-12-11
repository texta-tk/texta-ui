import {Component, OnInit} from '@angular/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DatasetImporterService} from '../../../core/tools/dataset-importer/dataset-importer.service';

@Component({
  selector: 'app-create-dataset-dialog',
  templateUrl: './create-dataset-dialog.component.html',
  styleUrls: ['./create-dataset-dialog.component.scss']
})
export class CreateDatasetDialogComponent implements OnInit {

  importerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    newNameFormControl: new FormControl('', [Validators.required]),
    separatorFormControl: new FormControl(''),
    fileFormControl: new FormControl({value: [], disabled: true}),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  indices: string[];
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<CreateDatasetDialogComponent>,
              private projectService: ProjectService,
              private importerService: DatasetImporterService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(project => {
      if (project) {
        this.currentProject = project;
      }
    })

  }

  onSubmit(formData) {
    // temp
    const fieldsToSend = formData.fieldsFormControl.map(x => x.path);
    const body = {
      description: formData.descriptionFormControl,
      new_index: formData.newNameFormControl,
    };
    this.importerService.createIndex(body, this.currentProject.id).subscribe((resp: unknown | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        console.log(resp);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

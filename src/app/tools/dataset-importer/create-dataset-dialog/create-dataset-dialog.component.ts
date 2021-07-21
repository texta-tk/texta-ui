import {Component, OnDestroy, OnInit} from '@angular/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {auditTime, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DatasetImporterService} from '../../../core/tools/dataset-importer/dataset-importer.service';
import {FileValidator} from 'ngx-material-file-input';
import {HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';

function indexNameValidator(control: AbstractControl): null | ValidationErrors {
  if (typeof control.value === 'string') {
    const controlValue = control.value;
    if (controlValue.toLowerCase() !== controlValue) {
      return {notLowerCase: true};
    }
    if (controlValue.includes('*')){
      return {wildCard: true};
    }
    if (controlValue.includes(':')){
      return {colon: true};
    }
  }
  return null;
}

@Component({
  selector: 'app-create-dataset-dialog',
  templateUrl: './create-dataset-dialog.component.html',
  styleUrls: ['./create-dataset-dialog.component.scss']
})
export class CreateDatasetDialogComponent implements OnInit, OnDestroy {
  readonly maxSize = 1048576000000; // 976 gigabytes
  importerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    newNameFormControl: new FormControl('', [Validators.required, indexNameValidator]),
    separatorFormControl: new FormControl(''),
    fileFormControl: new FormControl(undefined,
      [Validators.required, FileValidator.maxContentSize(this.maxSize)]),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  indices: string[];
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  uploadProgress = 0;
  uploadProgressQueue: Subject<number> = new Subject<number>();
  uploadedBytes = 0;
  totalBytes = 0;

  dataSetImporterOptions: any;

  constructor(private dialogRef: MatDialogRef<CreateDatasetDialogComponent>,
              private projectService: ProjectService,
              private importerService: DatasetImporterService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {

    this.projectStore.getCurrentProject().pipe(take(1), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.importerService.getDatasetImporterOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp instanceof HttpErrorResponse)) {
          this.dataSetImporterOptions = resp;
        } else {
          this.logService.snackBarError(resp, 2000);
        }
      }
    });
    this.uploadProgressQueue.pipe(takeUntil(this.destroyed$), auditTime(240)).subscribe(x => this.uploadProgress = x);
  }

  onSubmit(formData: {
    descriptionFormControl: string; newNameFormControl: string; separatorFormControl: string;
    fileFormControl: { files: (string | Blob)[]; };
  }): void {
    const postData = new FormData();
    postData.set('description', formData.descriptionFormControl);
    postData.set('index', formData.newNameFormControl);
    postData.set('separator', formData.separatorFormControl);
    postData.set('file', formData.fileFormControl.files[0]);

    this.importerService.createIndex(postData, this.currentProject.id).pipe(
      takeUntil(this.destroyed$)).subscribe(response => {
      if (response instanceof HttpErrorResponse) {
        this.logService.snackBarError(response);
      } else if (response.type === HttpEventType.UploadProgress) {
        this.uploadedBytes = response.loaded || 0;
        this.totalBytes = response.total || 0;
        this.uploadProgressQueue.next(Math.floor((this.uploadedBytes / this.totalBytes) * 100));
      } else if (response instanceof HttpResponse) {
        this.dialogRef.close(response.body);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

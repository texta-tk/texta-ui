import {Component, OnDestroy, OnInit} from '@angular/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {auditTime, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {DatasetImporterService} from '../../../core/tools/dataset-importer/dataset-importer.service';
import {HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';
import {maxContentSize} from '../../../shared/types/file-input';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

@Component({
  selector: 'app-create-dataset-dialog',
  templateUrl: './create-dataset-dialog.component.html',
  styleUrls: ['./create-dataset-dialog.component.scss']
})
export class CreateDatasetDialogComponent implements OnInit, OnDestroy {
  readonly maxSize = 1048576000000; // 976 gigabytes
  importerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    newNameFormControl: new UntypedFormControl('', [Validators.required, UtilityFunctions.indexNameValidator]),
    separatorFormControl: new UntypedFormControl(''),
    fileFormControl: new UntypedFormControl(undefined,
      [Validators.required, maxContentSize(this.maxSize)]),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  indices: string[];
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  uploadProgress = 0;
  uploadProgressQueue: Subject<number> = new Subject<number>();
  uploadedBytes = 0;
  totalBytes = 0;

  // tslint:disable-next-line:no-any
  dataSetImporterOptions: any | undefined;
  isCSVFile = false;

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
    this.importerForm.controls.fileFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      this.isCSVFile = !!(resp.files && resp.files[0] && resp.files[0].name.split('.').pop() === 'csv');
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

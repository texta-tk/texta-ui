import {Component, OnDestroy, OnInit} from '@angular/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {auditTime, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {DatasetImporterService} from '../../../core/tools/dataset-importer/dataset-importer.service';
import {FileValidator} from 'ngx-material-file-input';
import {HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-create-dataset-dialog',
  templateUrl: './create-dataset-dialog.component.html',
  styleUrls: ['./create-dataset-dialog.component.scss']
})
export class CreateDatasetDialogComponent implements OnInit, OnDestroy {
  readonly maxSize = 1048576000000; // 976 gigabytes
  importerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    newNameFormControl: new FormControl('', [Validators.required]),
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
    });
    this.uploadProgressQueue.pipe(takeUntil(this.destroyed$), auditTime(240)).subscribe(x => this.uploadProgress = x);
  }

  onSubmit(formData) {
    const postData = new FormData();
    postData.set('description', formData.descriptionFormControl);
    postData.set('index', formData.descriptionFormControl);
    postData.set('separator', formData.descriptionFormControl);
    postData.set('file', formData.fileFormControl.files[0]);

    this.importerService.createIndex(postData, this.currentProject.id).pipe(
      takeUntil(this.destroyed$)).subscribe((response: HttpEvent<any>) => {
      if (response instanceof HttpErrorResponse) {
        this.logService.snackBarError(response, 2000);
      } else if (response.type === HttpEventType.UploadProgress) {
        this.uploadedBytes = response.loaded;
        this.totalBytes = response.total;
        this.uploadProgressQueue.next(Math.floor((response.loaded / response.total) * 100));
      } else if (response instanceof HttpResponse) {
        this.dialogRef.close(response.body);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

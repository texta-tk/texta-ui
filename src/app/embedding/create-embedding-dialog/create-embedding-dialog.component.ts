import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomErrorStateMatcher} from '../../../shared/CustomErrorStateMatcher';
import {debounceTime, map, mergeMap, startWith, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {ProjectService} from '../../core/projects/project.service';
import {Field, ProjectFields} from '../../../shared/types/ProjectFields';
import {Embedding} from '../../../shared/types/Embedding';

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-embedding-dialog.component.html',
  styleUrls: ['./create-embedding-dialog.component.scss']
})
export class CreateEmbeddingDialogComponent implements OnInit {

  embeddingForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    queryFormControl: new FormControl('', []),
    fieldsFormControl: new FormControl([], [Validators.required]),
    dimensionsFormControl: new FormControl(100, [Validators.required]),
    frequencyFormControl: new FormControl(5, [Validators.required])

  });
  defaultQuery = '{"query": {"match_all": {}}}';
  matcher: ErrorStateMatcher = new CustomErrorStateMatcher();
  projectFields: ProjectFields;

  constructor(private dialogRef: MatDialogRef<CreateEmbeddingDialogComponent>,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.projectService.getProjectFields(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: ProjectFields | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFields = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  onSubmit(formData) {
    const queryToSend = formData.queryFormControl === '' ? this.defaultQuery : formData.queryFormControl;
    // temp
    const fieldsToSend = this.generateFieldsFormat(formData.fieldsFormControl);
    const body = {
      description: formData.descriptionFormControl,
      query: queryToSend,
      fields: fieldsToSend,
      num_dimensions: formData.dimensionsFormControl,
      min_freq: formData.frequencyFormControl
    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.embeddingService.createEmbedding(body, project.id);
      }
      return of(null);
    })).subscribe((resp: Embedding | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  generateFieldsFormat(fields: Field[]) {
    const output = [];
    for (const field of fields) {
      output.push(field.path);
    }
    return output;
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}

import {Component, OnInit} from '@angular/core';
import {Reindexer} from 'src/app/shared/types/tools/Elastic';
import {ReindexerService} from '../../../core/reindexer/reindexer.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {ProjectField, Project, Field} from 'src/app/shared/types/Project';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {take, mergeMap} from 'rxjs/operators';
import {of, forkJoin} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-create-reindexer-dialog',
  templateUrl: './create-reindexer-dialog.component.html',
  styleUrls: ['./create-reindexer-dialog.component.scss']
})
export class CreateReindexerDialogComponent implements OnInit {

  reindexerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    newNameFormControl: new FormControl('', [Validators.required]),
    randomSizeFormControl: new FormControl(''),
    fieldsFormControl: new FormControl([]),
    fieldTypesFormControl: new FormControl(''),
    indicesFormControl: new FormControl([], [Validators.required]),
  });
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectFields: ProjectField[];
  indices: string[];
  reindexerOptions: any;

  constructor(private dialogRef: MatDialogRef<CreateReindexerDialogComponent>,
              private projectService: ProjectService,
              private reindexerService: ReindexerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.indices = currentProject.indices;
        return forkJoin(
          {
            reindexerOptions: this.reindexerService.getReindexerOptions(currentProject.id),
            projectFields: this.projectService.getProjectFields(currentProject.id),
          });
      } else {
        return of(null);
      }
    })).subscribe((resp: {
      reindexerOptions: any | HttpErrorResponse,
      projectFields: ProjectField[] | HttpErrorResponse,
    }) => {
      if (resp) {
        if (!(resp.projectFields instanceof HttpErrorResponse)) {
          this.projectFields = ProjectField.cleanProjectFields(resp.projectFields);
        } else {
          this.logService.snackBarError(resp.projectFields, 2000);
        }
        if (!(resp.reindexerOptions instanceof HttpErrorResponse)) {
          this.reindexerOptions = resp.reindexerOptions;
        } else {
          this.logService.snackBarError(resp.reindexerOptions, 2000);
        }
      }
    });
  }

  onQueryChanged(query: string) {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData) {
    // temp
    const fieldsToSend = this.generateFieldsFormat(formData.fieldsFormControl);
    const body = {
      description: formData.descriptionFormControl,
      new_index: formData.newNameFormControl,
      fields: fieldsToSend,
      field_type: formData.fieldTypesFormControl ? JSON.parse(formData.fieldTypesFormControl) : [],
      indices: formData.indicesFormControl,
    };
    if (formData.randomSizeFormControl.value) {
      body['random_size'] = formData.randomSizeFormControl;
    }

    if (this.query) {
      body['query'] = this.query;
    }

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.reindexerService.createReindexer(body, project.id);
      }
      return of(null);
    })).subscribe((resp: Reindexer | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        console.log(resp);
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

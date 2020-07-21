import {Component, OnInit} from '@angular/core';
import {ReindexerService} from '../../../core/tools/reindexer/reindexer.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {Field, ProjectIndex} from 'src/app/shared/types/Project';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';
import {MatSelectChange} from '@angular/material/select';

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
    fieldsFormControl: new FormControl({value: [], disabled: true}),
    fieldTypesFormControl: new FormControl(''),
    indicesFormControl: new FormControl([], [Validators.required]),
  });
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectFields: ProjectIndex[];
  filteredProjectFields: ProjectIndex[] = [];
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
            projectFields: this.projectService.getProjectIndices(currentProject.id),
          });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.projectFields instanceof HttpErrorResponse)) {
          this.projectFields = ProjectIndex.sortTextaFactsAsFirstItem(resp.projectFields);
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

  onIndexSelected(val: MatSelectChange) {
    this.filteredProjectFields = this.projectFields.filter(x => val.value.includes(x.index));
    if (this.filteredProjectFields.length > 0) {
      this.reindexerForm.get('fieldsFormControl')?.reset({
        value: [].concat.apply([], this.filteredProjectFields.map(x => x.fields) as never),
        disabled: false
      });
    } else {
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.reindexerForm.get('fieldsFormControl')!.disable();
    }
  }

  onSubmit(formData: {
    fieldsFormControl: Field[]; descriptionFormControl: string;
    newNameFormControl: string; fieldTypesFormControl: string; indicesFormControl: string[]; randomSizeFormControl: number;
  }) {
    // temp
    const fieldsToSend = formData.fieldsFormControl.map(x => x.path);
    const body = {
      description: formData.descriptionFormControl,
      new_index: formData.newNameFormControl,
      fields: fieldsToSend,
      field_type: formData.fieldTypesFormControl ? JSON.parse(formData.fieldTypesFormControl) : [],
      indices: formData.indicesFormControl,
      ...this.query ? {query: this.query} : {},
      ...formData.randomSizeFormControl ? {random_size: formData.randomSizeFormControl} : {},
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.reindexerService.createReindexer(body, project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        if (resp.status === 400 && resp.error.new_index) {
          // todo fix in TS 3.7
          // tslint:disable-next-line:no-non-null-assertion
          this.reindexerForm.get('newNameFormControl')!.setErrors({alreadyExists: true});
        } else {
          this.dialogRef.close(resp);
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ReindexerService} from '../../../core/tools/reindexer/reindexer.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from 'src/app/shared/types/Project';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {IndexSplitter} from '../../../shared/types/tasks/IndexSplitter';
import {Reindexer} from '../../../shared/types/tools/Elastic';

type FieldTypesModel = { path: string, new_path_name: string, field_type: string };

@Component({
  selector: 'app-create-reindexer-dialog',
  templateUrl: './create-reindexer-dialog.component.html',
  styleUrls: ['./create-reindexer-dialog.component.scss']
})
export class CreateReindexerDialogComponent implements OnInit, OnDestroy {

  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.data?.cloneElement?.query || this.defaultQuery;

  reindexerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.cloneElement?.description || '', [Validators.required]),
    newNameFormControl: new UntypedFormControl(this.data?.cloneElement?.new_index || '', [Validators.required]),
    randomSizeFormControl: new UntypedFormControl(this.data?.cloneElement?.random_size || ''),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    fieldTypesFormControl: new UntypedFormControl(''),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    addFactsMappingFormControl: new UntypedFormControl(this.data?.cloneElement?.add_facts_mapping !== undefined ? this.data?.cloneElement?.add_facts_mapping : false)
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  // tslint:disable-next-line:no-any
  reindexerOptions: any | undefined;
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldTypesModel: FieldTypesModel[] = [];
  supportedElasticTypes: string[] = ['boolean', 'date', 'fact', 'float', 'long', 'text', 'mlp'];

  constructor(private dialogRef: MatDialogRef<CreateReindexerDialogComponent>,
              private projectService: ProjectService,
              private reindexerService: ReindexerService,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneElement: Reindexer },
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {

    this.projectStore.getCurrentProject().pipe(take(1), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          reindexerOptions: this.reindexerService.getReindexerOptions(currentProject.id),
          projectIndices: this.projectStore.getProjectIndices().pipe(take(1)), // take 1 to complete observable
        });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp instanceof HttpErrorResponse)) {
          this.reindexerOptions = resp;
        } else {
          this.logService.snackBarError(resp, 2000);
        }
      }
      if (resp?.reindexerOptions && !(resp?.reindexerOptions instanceof HttpErrorResponse)) {
        this.reindexerOptions = resp?.reindexerOptions;
      }
      if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
        this.projectIndices = resp.projectIndices;
        if (this.data.cloneElement) {
          const indexInstances = resp.projectIndices.filter(x => this.data.cloneElement.indices.some(y => y === x.index));
          const indicesForm = this.reindexerForm.get('indicesFormControl');
          indicesForm?.setValue(indexInstances);
          this.indicesOpenedChange(false); // refreshes the field and fact selection data
          const fieldsForm = this.reindexerForm.get('fieldsFormControl');
          fieldsForm?.setValue(this.data.cloneElement.fields);
          this.fieldTypesModel = this.data.cloneElement.field_type;
        }
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.projectStore.getSelectedProjectIndices().pipe(take(1), filter(x => !!x)).subscribe(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneElement) {
        const indicesForm = this.reindexerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = currentProjIndices;
      }
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.reindexerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = indicesForm?.value;
    }
  }

  onSubmit(formData: {
    fieldsFormControl: Field[]; descriptionFormControl: string;
    newNameFormControl: string; fieldTypesFormControl: string; indicesFormControl: { index: string }[]; randomSizeFormControl: number;
    addFactsMappingFormControl: boolean;
  }): void {
    const fieldsToSend = formData.fieldsFormControl.map(x => x.path);
    const body = {
      description: formData.descriptionFormControl,
      new_index: formData.newNameFormControl,
      fields: fieldsToSend,
      field_type: this.fieldTypesModel ? this.fieldTypesModel : [],
      indices: formData.indicesFormControl.map(x => x.index),
      ...this.query ? {query: this.query} : {},
      ...formData.randomSizeFormControl ? {random_size: formData.randomSizeFormControl} : {},
      add_facts_mapping: formData.addFactsMappingFormControl
    };

    this.reindexerService.createReindexer(body, this.currentProject.id).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        if (resp.status === 400 && resp.error.new_index) {
          this.reindexerForm.get('newNameFormControl')?.setErrors({alreadyExists: true});
        } else {
          this.logService.snackBarError(resp);
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  fieldsOpenedChange($event: boolean): void {
    // false is panel closed state
    if (!$event) {
      const val = this.reindexerForm.get('fieldsFormControl')?.value as Field[];
      if (val) {
        const newFieldModel: FieldTypesModel[] = [];
        val.forEach(field => {
          newFieldModel.push({path: field.path, new_path_name: field.path, field_type: field.type});
        });
        this.fieldTypesModel = newFieldModel;
      }
    }
  }
}

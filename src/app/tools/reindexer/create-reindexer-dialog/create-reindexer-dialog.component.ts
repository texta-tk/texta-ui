import {Component, OnInit} from '@angular/core';
import {ReindexerService} from '../../../core/tools/reindexer/reindexer.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from 'src/app/shared/types/Project';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

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
    fieldsFormControl: new FormControl([], [Validators.required]),
    fieldTypesFormControl: new FormControl(''),
    indicesFormControl: new FormControl([], [Validators.required]),
    addFactsMappingFormControl: new FormControl(false)
  });
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  reindexerOptions: unknown;
  currentProject: Project;

  constructor(private dialogRef: MatDialogRef<CreateReindexerDialogComponent>,
              private projectService: ProjectService,
              private reindexerService: ReindexerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.reindexerService.getReindexerOptions(currentProject.id);
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
    });
    this.projectStore.getSelectedProjectIndices().pipe(take(1), filter(x => !!x)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.reindexerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = currentProjIndices;
      }
    });
    this.projectStore.getProjectIndices().pipe(take(1), filter(x => !!x)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
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
    fieldsFormControl: string[]; descriptionFormControl: string;
    newNameFormControl: string; fieldTypesFormControl: string; indicesFormControl: string[]; randomSizeFormControl: number;
    addFactsMappingFormControl: boolean;
  }): void {
    // temp
    const fieldsToSend = formData.fieldsFormControl;
    const body = {
      description: formData.descriptionFormControl,
      new_index: formData.newNameFormControl,
      fields: fieldsToSend,
      field_type: formData.fieldTypesFormControl ? JSON.parse(formData.fieldTypesFormControl) : [],
      indices: formData.indicesFormControl,
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

}

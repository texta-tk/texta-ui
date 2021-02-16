import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {ProjectService} from '../../../core/projects/project.service';
import {IndexSplitterService} from '../../../core/tools/index-splitter/index-splitter.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {IndexSplitterOptions} from '../../../shared/types/tasks/IndexSplitter';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: Field[];
  scrollSizeFormControl: number;
  trainIndexFormControl: string;
  testIndexFormControl: string;
  testSizeIndexFormControl: number;
  factFormControl: string;
  strValFormControl: string;
  distributionFormControl: { value: string, display_name: string };
  customDistributionFormControl: string;
}

@Component({
  selector: 'app-create-index-splitter-dialog',
  templateUrl: './create-index-splitter-dialog.component.html',
  styleUrls: ['./create-index-splitter-dialog.component.scss']
})
export class CreateIndexSplitterDialogComponent implements OnInit, OnDestroy {

  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  indexSplitterForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([]),
    scrollSizeFormControl: new FormControl(500, [Validators.required]),
    trainIndexFormControl: new FormControl('', [Validators.required]),
    testIndexFormControl: new FormControl('', [Validators.required]),
    testSizeIndexFormControl: new FormControl(20, [Validators.required]),
    factFormControl: new FormControl(''),
    strValFormControl: new FormControl(''),
    distributionFormControl: new FormControl(''),
    customDistributionFormControl: new FormControl(''),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  indexSplitterOptions: IndexSplitterOptions;

  constructor(private dialogRef: MatDialogRef<CreateIndexSplitterDialogComponent>,
              private projectService: ProjectService,
              private indexSplitterService: IndexSplitterService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.indexSplitterForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.getFieldsForIndices(currentProjIndices);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });
    this.projectStore.getCurrentProject().pipe(take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.indexSplitterService.getIndexSplitterOptions(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.indexSplitterOptions = resp;
        const distributionType = this.indexSplitterForm.get('distributionFormControl');
        if (distributionType) {
          distributionType.setValue(resp.actions.POST.distribution.choices[0]);
        }
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      scroll_size: formData.scrollSizeFormControl,
      train_index: formData.trainIndexFormControl,
      test_index: formData.testIndexFormControl,
      test_size: formData.testSizeIndexFormControl,
      ...formData.factFormControl ? {fact: formData.factFormControl} : {},
      ...formData.strValFormControl ? {str_val: formData.strValFormControl} : {},
      distribution: formData.distributionFormControl.value,
      custom_distribution: formData.customDistributionFormControl,
      ...this.query ? {query: this.query} : {},
    };

    this.indexSplitterService.createIndexSplitterTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else {
        if (resp.error.test_index) {
          this.logService.snackBarMessage('This Test index name already exists!', 5000);
        } else if (resp.error.train_index) {
          this.logService.snackBarMessage('This Train index name already exists!', 5000);
        } else {
          this.logService.snackBarError(resp);
        }
      }
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  getFieldsForIndices(indices: ProjectIndex[]): void {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.indexSplitterForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {debounceTime, filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {SearchTaggerService} from '../../../core/models/taggers/search-tagger/search-tagger.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LogService} from '../../../core/util/log.service';
import {MatSelectChange} from '@angular/material/select';

interface OnSubmitParams {
  fieldsFormControl: string[];
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  factNameFormControl: string;
  factValueFormControl: string;
  bulkSizeFormControl: number;
  esTimeoutFormControl: number;

}

@Component({
  selector: 'app-create-search-tagger-dialog',
  templateUrl: './create-search-tagger-dialog.component.html',
  styleUrls: ['./create-search-tagger-dialog.component.scss']
})
export class CreateSearchTaggerDialogComponent implements OnInit, OnDestroy {

  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  searchTaggerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    factNameFormControl: new UntypedFormControl('', [Validators.required]),
    factValueFormControl: new UntypedFormControl('', [Validators.required]),
    bulkSizeFormControl: new UntypedFormControl(100, [Validators.required]),
    esTimeoutFormControl: new UntypedFormControl(10),
  });

  isLoadingOptions = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  factValueOptions: string[] = [];
  // tslint:disable-next-line:no-any
  searchTaggerOptions: any;
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateSearchTaggerDialogComponent>,
              private projectService: ProjectService,
              private searchTaggerService: SearchTaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.searchTaggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.filterFields(currentProjIndices, ['text'], []);
      }
    });
    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.searchTaggerService.getSearchFieldsTaggerOptions(proj.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.searchTaggerOptions = options;
      }
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    this.createRequestInProgress = true;
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      fact_name: formData.factNameFormControl,
      fact_value: formData.factValueFormControl,
      ...this.query ? {query: this.query} : {},
      bulk_size: formData.bulkSizeFormControl,
      es_timeout: formData.esTimeoutFormControl,
    };

    this.searchTaggerService.createSearchQueryTaggerTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
      this.createRequestInProgress = false;
    });
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.searchTaggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.filterFields(indicesForm.value, ['text'], []);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

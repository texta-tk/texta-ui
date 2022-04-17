import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {CRFExtractor} from '../../../shared/types/tasks/CRFExtractor';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {CRFExtractorService} from '../../../core/models/crf-extractor/crf-extractor.service';

interface SubmitFormModel {
  indicesFormControl: ProjectIndex[];
  mlpFieldsFormControl: Field[];
  factNameFormControl: string;
  esTimeoutFormControl: number;
  bulkSizeFormControl: number;
  maxChunkSizeFormControl: number;
  labelSuffixFormControl: string;
}

@Component({
  selector: 'app-apply-to-index-dialog',
  templateUrl: './apply-to-index-dialog.component.html',
  styleUrls: ['./apply-to-index-dialog.component.scss']
})
export class ApplyToIndexDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  applyForm = new FormGroup({
    indicesFormControl: new FormControl([], [Validators.required]),
    mlpFieldsFormControl: new FormControl('', [Validators.required]),
    esTimeoutFormControl: new FormControl(10),
    bulkSizeFormControl: new FormControl(100),
    maxChunkSizeFormControl: new FormControl(104857600),
    labelSuffixFormControl: new FormControl(),

  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  indices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  // tslint:disable-next-line:no-any
  crfOptions: any;

  constructor(private dialogRef: MatDialogRef<ApplyToIndexDialogComponent>,
              private projectService: ProjectService,
              @Inject(MAT_DIALOG_DATA) public data: CRFExtractor,
              private crfExtractorService: CRFExtractorService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.crfExtractorService.applyToIndexOptions(proj.id, this.data.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.crfOptions = options;
        this.applyForm.get('esTimeoutFormControl')?.setValue(options.actions.POST.es_timeout.default);
        this.applyForm.get('bulkSizeFormControl')?.setValue(options.actions.POST.bulk_size.default);
        this.applyForm.get('maxChunkSizeFormControl')?.setValue(options.actions.POST.max_chunk_bytes.default);
      }
    });
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(indices => {
      if (indices) {
        this.indices = indices;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.applyForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['mlp'], []);
      }
    });
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.applyForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm?.value, ['mlp'], []);
    }
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: SubmitFormModel): void {
    const body = {
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      mlp_fields: formData.mlpFieldsFormControl,
      ...this.query ? {query: this.query} : {},
      ...formData.esTimeoutFormControl ? {es_timeout: formData.esTimeoutFormControl} : {},
      ...formData.factNameFormControl ? {new_fact_name: formData.factNameFormControl} : {},
      ...formData.bulkSizeFormControl ? {bulk_size: formData.bulkSizeFormControl} : {},
      ...formData.labelSuffixFormControl ? {label_suffix: formData.labelSuffixFormControl} : {},
    };
    this.crfExtractorService.applyToIndex(this.currentProject.id, this.data.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`${resp.message}`, 2000);
        this.dialogRef.close(resp);
      } else {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

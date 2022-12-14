import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../../../core/projects/project.store';
import {Field, ProjectIndex} from '../../../../shared/types/Project';
import {ProjectService} from '../../../../core/projects/project.service';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {LogService} from '../../../../core/util/log.service';
import {EmbeddingOptions} from '../../../../shared/types/tasks/Embedding';

interface OnSubmitParams {
  fieldsFormControl: string[];
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  dimensionsFormControl: number;
  frequencyFormControl: number;
  usePhraserFormControl: boolean;
  embeddingTypeFormControl: { value: string, display_name: string };
  windowSizeFormControl: number;
  epochFormControl: number;
}

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-embedding-dialog.component.html',
  styleUrls: ['./create-embedding-dialog.component.scss']
})
export class CreateEmbeddingDialogComponent implements OnInit {

  embeddingForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [
      Validators.required,
    ]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    embeddingTypeFormControl: new UntypedFormControl(),
    dimensionsFormControl: new UntypedFormControl(100, [Validators.required]),
    frequencyFormControl: new UntypedFormControl(5, [Validators.required]),
    epochFormControl: new UntypedFormControl(5, [Validators.required]),
    windowSizeFormControl: new UntypedFormControl(5, [Validators.required]),
    usePhraserFormControl: new UntypedFormControl(false)

  });
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectFields: ProjectIndex[];
  destroyed$ = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  embeddingOptions: EmbeddingOptions | undefined;

  constructor(private dialogRef: MatDialogRef<CreateEmbeddingDialogComponent>,
              private projectService: ProjectService,
              private logService: LogService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.embeddingForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.filterFields(currentProjIndices, ['text'], []);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(take(1), switchMap(proj => {
      if (proj) {
        return this.embeddingService.getEmbeddingOptions(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.embeddingOptions = resp;
        const embeddingType = this.embeddingForm.get('embeddingTypeFormControl');
        if (embeddingType) {
          embeddingType.setValue(resp.actions.POST.embedding_type.choices[0]);
        }
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.embeddingForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.filterFields(indicesForm.value, ['text'], []);
    }
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: OnSubmitParams): void {
    this.isLoading = true;
    const body = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      num_dimensions: formData.dimensionsFormControl,
      embedding_type: formData.embeddingTypeFormControl.value,
      min_freq: formData.frequencyFormControl,
      use_phraser: formData.usePhraserFormControl,
      num_epochs: formData.epochFormControl,
      window_size: formData.windowSizeFormControl,
      ...this.query ? {query: this.query} : {},
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.embeddingService.createEmbedding(body, project.id);
      }
      return of(null);
    })).subscribe(resp => {
      this.isLoading = false;
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

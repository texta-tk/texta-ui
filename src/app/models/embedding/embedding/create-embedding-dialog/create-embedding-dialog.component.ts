import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../../../core/projects/project.store';
import {Field, ProjectIndex} from '../../../../shared/types/Project';
import {ProjectService} from '../../../../core/projects/project.service';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {LogService} from "../../../../core/util/log.service";
import {EmbeddingOptions} from "../../../../shared/types/tasks/Embedding";

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
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    embeddingTypeFormControl: new FormControl(),
    dimensionsFormControl: new FormControl(100, [Validators.required]),
    frequencyFormControl: new FormControl(5, [Validators.required]),
    usePhraserFormControl: new FormControl(false)

  });
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  projectFields: ProjectIndex[];
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  embeddingOptions: EmbeddingOptions;

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

  getFieldsForIndices(indices: ProjectIndex[]): void {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.embeddingForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: {
    fieldsFormControl: Field[]; descriptionFormControl: string;
    indicesFormControl: ProjectIndex[]; dimensionsFormControl: number; frequencyFormControl: number; usePhraserFormControl: boolean; embeddingTypeFormControl: { value: string, display_name: string }
  }): void {
    // temp
    const fieldsToSend = this.generateFieldsFormat(formData.fieldsFormControl);
    const body = {
      description: formData.descriptionFormControl,
      fields: fieldsToSend,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      num_dimensions: formData.dimensionsFormControl,
      embedding_type: formData.embeddingTypeFormControl.value,
      min_freq: formData.frequencyFormControl,
      use_phraser: formData.usePhraserFormControl,
      ...this.query ? {query: this.query} : {},
    };

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.embeddingService.createEmbedding(body, project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  generateFieldsFormat(fields: Field[]): string[] {
    const output: string[] = [];
    for (const field of fields) {
      output.push(field.path);
    }
    return output;
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

}

import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {Embedding} from 'src/app/shared/types/tasks/Embedding';
import {Field, Project, ProjectFact, ProjectIndex} from 'src/app/shared/types/Project';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {TorchTagger} from 'src/app/shared/types/tasks/TorchTagger';
import {EmbeddingsService} from 'src/app/core/models/embeddings/embeddings.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {MatSelect} from '@angular/material/select';

interface OnSubmitParams {
  formData: {
    descriptionFormControl: string;
    fieldsFormControl: Field[];
    indicesFormControl: ProjectIndex[];
    embeddingFormControl: number;
    sampleSizeFormControl: number;
    minSampleSizeFormControl: number;
    numEpochsFormControl: number;
    modelArchitectureFormControl: string;
    factNameFormControl: string
  };
}

@Component({
  selector: 'app-create-torch-tagger-dialog',
  templateUrl: './create-torch-tagger-dialog.component.html',
  styleUrls: ['./create-torch-tagger-dialog.component.scss']
})
export class CreateTorchTaggerDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  torchTaggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    embeddingFormControl: new FormControl('', [Validators.required]),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    minSampleSizeFormControl: new FormControl(50, [Validators.required]),
    factNameFormControl: new FormControl(),
    modelArchitectureFormControl: new FormControl('', [Validators.required]),
    numEpochsFormControl: new FormControl(5, [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  torchTaggerOptions: any;
  embeddings: Embedding[] = [];
  projectFields: ProjectIndex[];
  projectFacts: ProjectFact[];
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  currentProject: Project;
  projectIndices: ProjectIndex[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;

  constructor(private dialogRef: MatDialogRef<CreateTorchTaggerDialogComponent>,
              private torchTaggerService: TorchTaggerService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin(
          {
            torchTaggerOptions: this.torchTaggerService.getTorchTaggerOptions(currentProject.id),
            projectEmbeddings: this.embeddingService.getEmbeddings(currentProject.id)
          });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.projectEmbeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.projectEmbeddings.results;
        }
        if (!(resp.torchTaggerOptions instanceof HttpErrorResponse)) {
          this.torchTaggerOptions = resp.torchTaggerOptions;
        }
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        const indicesForm = this.torchTaggerForm.get('indicesFormControl');
        indicesForm?.setValue(x);
        this.getFieldsForIndices(x);
      }
    });

    this.projectStore.getCurrentIndicesFacts().pipe(take(1)).subscribe(x => this.projectFacts = x ? x : []);
  }

  ngAfterViewInit(): void {
    this.indicesSelect.openedChange.pipe(takeUntil(this.destroyed$), switchMap(opened => {
      if (!opened && this.indicesSelect.value) {
        return this.projectService.getProjectFacts(this.currentProject.id, this.indicesSelect.value.map((x: ProjectIndex) => [{name: x.index}]).flat());
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
      }
    });
  }

  onQueryChanged(query: string) {
    this.query = query ? query : this.defaultQuery;
  }

  getFieldsForIndices(indices: ProjectIndex[]) {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened: unknown) {
    const indicesForm = this.torchTaggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  onSubmit({formData}: OnSubmitParams) {
    if (this.currentProject.id) {
      const body = {
        description: formData.descriptionFormControl,
        fields: formData.fieldsFormControl,
        indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
        embedding: formData.embeddingFormControl,
        maximum_sample_size: formData.sampleSizeFormControl,
        minimum_sample_size: formData.minSampleSizeFormControl,
        num_epochs: formData.numEpochsFormControl,
        model_architecture: formData.modelArchitectureFormControl,
        ...this.query ? {query: this.query} : {},
        ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl} : {},
      };
      this.torchTaggerService.createTorchTagger(this.currentProject.id, body).subscribe((resp: TorchTagger | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.dialogRef.close(resp);
        } else if (resp instanceof HttpErrorResponse) {
          this.dialogRef.close(resp);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

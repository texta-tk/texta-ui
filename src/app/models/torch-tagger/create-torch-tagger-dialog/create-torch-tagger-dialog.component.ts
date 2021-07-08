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
import {LogService} from '../../../core/util/log.service';

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
    factNameFormControl: { name: string, values: string[] };
    balanceFormControl: boolean;
    sentenceShuffleFormControl: boolean;
    maxBalanceFormControl: boolean;
    posLabelFormControl: string;
  };
}

@Component({
  selector: 'app-create-torch-tagger-dialog',
  templateUrl: './create-torch-tagger-dialog.component.html',
  styleUrls: ['./create-torch-tagger-dialog.component.scss']
})
export class CreateTorchTaggerDialogComponent implements OnInit, OnDestroy {
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
    posLabelFormControl: new FormControl(''),

    balanceFormControl: new FormControl({value: false, disabled: true}),
    sentenceShuffleFormControl: new FormControl({value: false, disabled: true}),
    maxBalanceFormControl: new FormControl({value: false, disabled: true}),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  // tslint:disable-next-line:no-any
  torchTaggerOptions: any;
  embeddings: Embedding[] = [];
  projectFields: ProjectIndex[];
  projectFacts: { name: string, values: string[] }[];
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  currentProject: Project;
  projectIndices: ProjectIndex[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;

  constructor(private dialogRef: MatDialogRef<CreateTorchTaggerDialogComponent>,
              private torchTaggerService: TorchTaggerService,
              private projectService: ProjectService,
              private logService: LogService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  initFormControlListeners(): void {

    this.torchTaggerForm.get('balanceFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.torchTaggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
        this.torchTaggerForm.get('sentenceShuffleFormControl')?.enable({emitEvent: false});
      } else {
        this.torchTaggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.torchTaggerForm.get('sentenceShuffleFormControl')?.disable({emitEvent: false});
      }
    });
    this.torchTaggerForm.get('factNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        if (this.torchTaggerForm.get('balanceFormControl')?.value) {
          this.torchTaggerForm.get('maxBalanceFormControl')?.enable({emitEvent: false});
          this.torchTaggerForm.get('sentenceShuffleFormControl')?.enable({emitEvent: false});
        }
        this.torchTaggerForm.get('balanceFormControl')?.enable({emitEvent: false});
      } else {
        this.torchTaggerForm.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.torchTaggerForm.get('balanceFormControl')?.disable({emitEvent: false});
        this.torchTaggerForm.get('sentenceShuffleFormControl')?.disable({emitEvent: false});
      }
    });
  }

  ngOnInit(): void {
    this.initFormControlListeners();

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

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        const indicesForm = this.torchTaggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
        this.projectFacts = [{name: 'Loading...', values: []}];
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), true);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
      } else if (resp) {
        this.logService.snackBarError(resp, 4000);
      }
    });

  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    if (val.length > 0 && this.currentProject.id) {
      this.projectFacts = [{name: 'Loading...', values: []}];
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), true).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts = resp;
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts = [];
    }
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.torchTaggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.getFactsForIndices(indicesForm?.value);
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
    }
  }

  onSubmit({formData}: OnSubmitParams): void {
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
        ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl.name} : {},
        ...formData.sentenceShuffleFormControl ? {use_sentence_shuffle: formData.sentenceShuffleFormControl} : {},
        ...formData.balanceFormControl ? {balance: formData.balanceFormControl} : {},
        ...formData.maxBalanceFormControl ? {balance_to_max_limit: formData.maxBalanceFormControl} : {},
        ...(formData.posLabelFormControl && formData.factNameFormControl.values.length === 2) ?
          {pos_label: formData.posLabelFormControl} : {},
      };
      this.torchTaggerService.createTorchTagger(this.currentProject.id, body).subscribe((resp: TorchTagger | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.dialogRef.close(resp);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

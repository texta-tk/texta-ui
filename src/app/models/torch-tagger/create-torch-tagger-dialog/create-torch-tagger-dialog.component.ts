import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from 'src/app/shared/CustomerErrorStateMatchers';
import {Choice, Embedding} from 'src/app/shared/types/tasks/Embedding';
import {Field, Project, ProjectFact, ProjectIndex} from 'src/app/shared/types/Project';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {ProjectService} from 'src/app/core/projects/project.service';
import {ProjectStore} from 'src/app/core/projects/project.store';
import {filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
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
    embeddingFormControl: Embedding;
    sampleSizeFormControl: number;
    minSampleSizeFormControl: number;
    numEpochsFormControl: number;
    modelArchitectureFormControl: Choice;
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
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.data?.cloneElement?.query || this.defaultQuery;

  torchTaggerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.cloneElement?.description || '', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    embeddingFormControl: new UntypedFormControl('', [Validators.required]),
    sampleSizeFormControl: new UntypedFormControl(this.data?.cloneElement?.maximum_sample_size || 10000, [Validators.required]),
    minSampleSizeFormControl: new UntypedFormControl(this.data?.cloneElement?.minimum_sample_size || 50, [Validators.required]),
    factNameFormControl: new UntypedFormControl(),
    modelArchitectureFormControl: new UntypedFormControl('', [Validators.required]),
    numEpochsFormControl: new UntypedFormControl(this.data?.cloneElement?.num_epochs || 5, [Validators.required]),
    posLabelFormControl: new UntypedFormControl(this.data?.cloneElement?.pos_label || ''),

    balanceFormControl: new UntypedFormControl({
      value: this.data?.cloneElement?.balance !== undefined ? this.data?.cloneElement?.balance : false,
      disabled: true
    }),
    sentenceShuffleFormControl: new UntypedFormControl({
      value: this.data?.cloneElement?.use_sentence_shuffle !== undefined ? this.data?.cloneElement?.use_sentence_shuffle : false,
      disabled: true
    }),
    maxBalanceFormControl: new UntypedFormControl({
      value: this.data?.cloneElement?.balance_to_max_limit !== undefined ? this.data?.cloneElement?.balance_to_max_limit : false,
      disabled: true
    }),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  // tslint:disable-next-line:no-any
  torchTaggerOptions: any;
  embeddings: Embedding[] = [];
  projectFields: ProjectIndex[];
  projectFacts: BehaviorSubject<{ name: string, values: string[] }[]> = new BehaviorSubject<{ name: string, values: string[] }[]>([{name: 'Loading...', values: []}]);
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  currentProject: Project;
  projectIndices: ProjectIndex[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateTorchTaggerDialogComponent>,
              private torchTaggerService: TorchTaggerService,
              private projectService: ProjectService,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneElement: TorchTagger },
              private embeddingService: EmbeddingsService,
              private changeDetectorRef: ChangeDetectorRef,
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
        this.torchTaggerForm.get('maxBalanceFormControl')?.setValue(false, {emitEvent: false});
        this.torchTaggerForm.get('sentenceShuffleFormControl')?.setValue(false, {emitEvent: false});
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
    this.projectFacts.pipe(filter(x => x[0]?.name !== 'Loading...'), take(1)).subscribe(facts => {
      if (facts && this.data?.cloneElement) {
        const factNameForm = this.torchTaggerForm.get('factNameFormControl');
        factNameForm?.setValue(facts.find(x => x.name === this.data.cloneElement.fact_name));
      }
    });
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin(
          {
            torchTaggerOptions: this.torchTaggerService.getTorchTaggerOptions(currentProject.id),
            projectEmbeddings: this.embeddingService.getEmbeddings(currentProject.id),
            projectIndices: this.projectStore.getProjectIndices().pipe(take(1)), // take 1 to complete observable
          });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (resp?.projectEmbeddings && !(resp.projectEmbeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.projectEmbeddings.results;
          if (this.data?.cloneElement?.embedding) {
            const foundEmbedding = this.embeddings.find(x => x.id === this.data.cloneElement.embedding);
            if (foundEmbedding) {
              this.torchTaggerForm.get('embeddingFormControl')?.setValue(foundEmbedding);
            }
          }
        }
        if (resp?.torchTaggerOptions && !(resp.torchTaggerOptions instanceof HttpErrorResponse)) {
          this.torchTaggerOptions = resp.torchTaggerOptions;
          const architecture = this.torchTaggerForm.get('modelArchitectureFormControl');
          if (architecture) {
            if (this.data?.cloneElement?.model_architecture) {
              // @ts-ignore
              const architectureVal = resp.torchTaggerOptions.actions.POST.model_architecture.choices.find(x => x.display_name === this.data.cloneElement.model_architecture);
              architecture.setValue(architectureVal);
            }
          }
        }
        if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
          this.projectIndices = resp.projectIndices;
          if (this.data.cloneElement) {
            const indexInstances = resp.projectIndices.filter(x => this.data.cloneElement.indices.some(y => y.name === x.index));
            const indicesForm = this.torchTaggerForm.get('indicesFormControl');
            indicesForm?.setValue(indexInstances);
            this.indicesOpenedChange(false); // refreshes the field and fact selection data
            const fieldsForm = this.torchTaggerForm.get('fieldsFormControl');
            fieldsForm?.setValue(this.data.cloneElement.fields);
          }
        }
        UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
      }
    });


    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices && !this.data.cloneElement) {
        const indicesForm = this.torchTaggerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.filterFields(currentProjIndices, ['text'], []);
        this.projectFacts.next([{name: 'Loading...', values: []}]);
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), true, false);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts.next(resp);
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
      this.projectFacts.next([{name: 'Loading...', values: []}]);
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), true, false).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.projectFacts.next(resp);
        } else {
          this.logService.snackBarError(resp);
        }
      });
    } else {
      this.projectFacts.next([]);
    }
  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.torchTaggerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.getFactsForIndices(indicesForm?.value);
      this.projectFields = ProjectIndex.filterFields(indicesForm.value, ['text'], []);
    }
  }

  onSubmit({formData}: OnSubmitParams): void {
    this.createRequestInProgress = true;
    if (this.currentProject.id) {
      const body = {
        description: formData.descriptionFormControl,
        fields: formData.fieldsFormControl,
        indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
        embedding: formData.embeddingFormControl ? formData.embeddingFormControl.id : null,
        maximum_sample_size: formData.sampleSizeFormControl,
        minimum_sample_size: formData.minSampleSizeFormControl,
        num_epochs: formData.numEpochsFormControl,
        ...formData.modelArchitectureFormControl ? {model_architecture: formData.modelArchitectureFormControl.value} : {},
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
        this.createRequestInProgress = false;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

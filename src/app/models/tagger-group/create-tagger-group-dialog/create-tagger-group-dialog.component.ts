import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../shared/types/Project';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {LogService} from '../../../core/util/log.service';
import {TaggerOptions} from '../../../shared/types/tasks/TaggerOptions';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {Embedding} from '../../../shared/types/tasks/Embedding';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {forkJoin, of, Subject} from 'rxjs';
import {TaggerGroupService} from '../../../core/models/taggers/tagger-group.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {MatSelect} from '@angular/material/select';
import {CoreService} from '../../../core/core.service';

@Component({
  selector: 'app-create-tagger-group-dialog',
  templateUrl: './create-tagger-group-dialog.component.html',
  styleUrls: ['./create-tagger-group-dialog.component.scss']
})
export class CreateTaggerGroupDialogComponent implements OnInit, OnDestroy, AfterViewInit {


  taggerGroupForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    factNameFormControl: new FormControl(),
    taggerGroupMinSampleSizeFormControl: new FormControl(50, [Validators.required]),
    taggerForm: new FormGroup({
      fieldsFormControl: new FormControl([], [Validators.required]),
      indicesFormControl: new FormControl([], [Validators.required]),
      stopWordsFormControl: new FormControl(''),
      embeddingFormControl: new FormControl(),
      snowballFormControl: new FormControl(),
      scoringFormControl: new FormControl(),
      analyzerFormControl: new FormControl([Validators.required]),
      vectorizerFormControl: new FormControl([Validators.required]),
      classifierFormControl: new FormControl([Validators.required]),
      sampleSizeFormControl: new FormControl(10000, [Validators.required]),
      negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),
      ignoreNumbersFormControl: new FormControl(true),
      detectLangFormControl: new FormControl(false),
      balanceFormControl: new FormControl({value: false, disabled: true}),
      maxBalanceFormControl: new FormControl({value: false, disabled: true}),
    })
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  // tslint:disable-next-line:no-any
  taggerGroupOptions: any;
  embeddings: Embedding[];
  projectFields: ProjectIndex[];
  projectFacts: string[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  snowballLanguages: string[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;

  constructor(private dialogRef: MatDialogRef<CreateTaggerGroupDialogComponent>,
              private taggerGroupService: TaggerGroupService,
              private logService: LogService,
              private projectService: ProjectService,
              private coreService: CoreService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  initFormControlListeners(): void {

    this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.setValue(false, {emitEvent: false});
      }
    });

    this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.enable({emitEvent: false});
      }
    });

    this.taggerGroupForm.get('taggerForm')?.get('snowballFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.disable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('detectLangFormControl')?.enable({emitEvent: false});
      }
    });
    this.taggerGroupForm.get('factNameFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        if (this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.value) {
          this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.enable({emitEvent: false});
        }
        this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.enable({emitEvent: false});
      } else {
        this.taggerGroupForm.get('taggerForm')?.get('maxBalanceFormControl')?.disable({emitEvent: false});
        this.taggerGroupForm.get('taggerForm')?.get('balanceFormControl')?.disable({emitEvent: false});
      }
    });
  }

  ngOnInit(): void {
    this.initFormControlListeners();

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.coreService.getSnowballLanguages().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.snowballLanguages = resp;
      } else {
        this.logService.snackBarError(resp);
      }
    });

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin(
          {
            taggerOptions: this.taggerGroupService.getTaggerGroupOptions(currentProject.id),
            embeddings: this.embeddingService.getEmbeddings(currentProject.id),
          });
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.taggerOptions instanceof HttpErrorResponse)) {
          this.taggerGroupOptions = resp.taggerOptions;
          this.setDefaultFormValues(this.taggerGroupOptions);
        }
        if (!(resp.embeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.embeddings.results;
        }
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      this.projectFacts = ['Loading...'];
      if (this.currentProject?.id && currentProjIndices) {
        const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat());
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

  ngAfterViewInit(): void {
    this.indicesSelect.openedChange.pipe(takeUntil(this.destroyed$), switchMap(opened => {
      if (!opened && this.indicesSelect.value) {
        this.projectFacts = ['Loading...'];
        return this.projectService.getProjectFacts(
          this.currentProject.id, this.indicesSelect.value.map((x: ProjectIndex) => [{name: x.index}]).flat());
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
      }
    });
  }


  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
    }
  }


  onSubmit(): void {
    const formData = this.taggerGroupForm.value;
    const taggerBody = {
      fields: formData.taggerForm.fieldsFormControl,
      indices: formData.taggerForm.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      ...formData?.taggerForm?.snowballFormControl ? {snowball_language: formData.taggerForm.snowballFormControl} : {},
      scoring_function: formData.taggerForm.scoringFormControl.value,
      analyzer:  formData.taggerForm.analyzerFormControl.value,
      vectorizer: formData.taggerForm.vectorizerFormControl.value,
      classifier: formData.taggerForm.classifierFormControl.value,
      maximum_sample_size: formData.taggerForm.sampleSizeFormControl,
      negative_multiplier: formData.taggerForm.negativeMultiplierFormControl,
      ignore_numbers: formData?.taggerForm?.ignoreNumbersFormControl,
      ...formData?.taggerForm?.embeddingFormControl?.id ? {embedding: formData.taggerForm.embeddingFormControl.id} : {},
      ...formData?.taggerForm?.detectLangFormControl ? {detect_lang: formData.taggerForm.detectLangFormControl} : {},
      ...formData?.taggerForm?.balanceFormControl ? {balance: formData.taggerForm.balanceFormControl} : {},
      ...formData?.taggerForm?.maxBalanceFormControl ? {balance_to_max_limit: formData.taggerForm.maxBalanceFormControl} : {},
      stop_words: formData?.taggerForm?.stopWordsFormControl.split('\n').filter((x: string) => !!x),
    };

    const body = {
      description: formData.descriptionFormControl,
      ...formData.factNameFormControl ? {fact_name: formData.factNameFormControl} : {},
      minimum_sample_size: formData.taggerGroupMinSampleSizeFormControl,
      tagger: taggerBody
    };
    if (this.currentProject) {
      this.taggerGroupService.createTaggerGroup(body, this.currentProject.id).subscribe(resp => {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        } else if (resp) {
          this.dialogRef.close(resp);
        }
      });
    }
  }

  // tslint:disable-next-line:no-any
  setDefaultFormValues(options: any): void {
    const taggerForm = this.taggerGroupForm.get('taggerForm');

    if (taggerForm) {
      const analyzer = taggerForm.get('analyzerFormControl');
      if (analyzer) {
        analyzer.setValue(options.actions.POST.tagger.children.analyzer.choices[0]);
      }
      const vectorizer = taggerForm.get('vectorizerFormControl');
      if (vectorizer) {
        vectorizer.setValue(options.actions.POST.tagger.children.vectorizer.choices[0]);
      }
      const classifier = taggerForm.get('classifierFormControl');
      if (classifier) {
        classifier.setValue(options.actions.POST.tagger.children.classifier.choices[0]);
      }
      const scoringFunction = taggerForm.get('scoringFormControl');
      if (scoringFunction) {
        scoringFunction.setValue(options.actions.POST.tagger.children.scoring_function.choices[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

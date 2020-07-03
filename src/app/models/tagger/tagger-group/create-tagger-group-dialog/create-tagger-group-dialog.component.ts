import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../../shared/types/Project';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {LogService} from '../../../../core/util/log.service';
import {TaggerOptions} from '../../../../shared/types/tasks/TaggerOptions';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProjectService} from '../../../../core/projects/project.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {Embedding} from '../../../../shared/types/tasks/Embedding';
import {TaggerService} from '../../../../core/models/taggers/tagger.service';
import {forkJoin, of, Subject} from 'rxjs';
import {TaggerGroupService} from '../../../../core/models/taggers/tagger-group.service';
import {TaggerGroup} from '../../../../shared/types/tasks/Tagger';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {MatSelect} from '@angular/material/select';

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
    factNameFormControl: new FormControl(Validators.required),
    taggerGroupSampleSizeFormControl: new FormControl(50, [Validators.required]),
    taggerForm: new FormGroup({
      fieldsFormControl: new FormControl([], [Validators.required]),
      indicesFormControl: new FormControl([], [Validators.required]),
      embeddingFormControl: new FormControl(),
      vectorizerFormControl: new FormControl([Validators.required]),
      classifierFormControl: new FormControl([Validators.required]),
      sampleSizeFormControl: new FormControl(10000, [Validators.required]),
      negativeMultiplierFormControl: new FormControl(1.0, [Validators.required]),

    })
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  taggerOptions: TaggerOptions = TaggerOptions.createEmpty();
  embeddings: Embedding[];
  projectFields: ProjectIndex[];
  projectFacts: ProjectFact[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  @ViewChild('indicesSelect') indicesSelect: MatSelect;

  constructor(private dialogRef: MatDialogRef<CreateTaggerGroupDialogComponent>,
              private taggerService: TaggerService,
              private taggerGroupService: TaggerGroupService,
              private logService: LogService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.getFieldsForIndices(currentProjIndices);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin(
          {
            taggerOptions: this.taggerService.getTaggerOptions(currentProject.id),
            embeddings: this.embeddingService.getEmbeddings(currentProject.id),
          });
      } else {
        return of(null);
      }
    })).subscribe((resp: {
      taggerOptions: TaggerOptions | HttpErrorResponse,
      embeddings: { count: number, results: Embedding[] } | HttpErrorResponse,
      projectFacts: ProjectFact[],
    }) => {
      if (resp) {
        if (!(resp.taggerOptions instanceof HttpErrorResponse)) {
          this.taggerOptions = resp.taggerOptions;
          this.setDefaultFormValues(this.taggerOptions);
        }
        if (!(resp.embeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.embeddings.results;
        }
      }
    });

    this.projectStore.getCurrentIndicesFacts().pipe(take(1)).subscribe(x => this.projectFacts = x ? x : []);
  }

  ngAfterViewInit(): void {
    this.indicesSelect.openedChange.pipe(takeUntil(this.destroyed$), switchMap(opened => {
      if (!opened && this.indicesSelect.value) {
        return this.projectService.getProjectFacts(this.currentProject.id, this.indicesSelect.value.map(x => [{name: x.index}]).flat());
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
      }
    });
  }

  getFieldsForIndices(indices: ProjectIndex[]) {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened) {
    const indicesForm = this.taggerGroupForm.get('taggerForm')?.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  onSubmit() {
    const formData = this.taggerGroupForm.value;
    const taggerBody: any = {
      fields: formData.taggerForm.fieldsFormControl,
      indices: formData.taggerForm.indicesFormControl.map(x => [{name: x.index}]).flat(),
      vectorizer: formData.taggerForm.vectorizerFormControl.value,
      classifier: formData.taggerForm.classifierFormControl.value,
      maximum_sample_size: formData.taggerForm.sampleSizeFormControl,
      negative_multiplier: formData.taggerForm.negativeMultiplierFormControl,
    };

    if (formData.taggerForm.embeddingFormControl) {
      taggerBody.embedding = formData.taggerForm.embeddingFormControl.id;
    }

    const body = {
      description: formData.descriptionFormControl,
      fact_name: formData.factNameFormControl,
      minimum_sample_size: formData.taggerGroupSampleSizeFormControl,
      tagger: taggerBody
    };

    if (this.currentProject) {
      this.taggerGroupService.createTaggerGroup(body, this.currentProject.id).subscribe((resp: TaggerGroup | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.dialogRef.close(resp);
        } else if (resp instanceof HttpErrorResponse) {
          this.dialogRef.close(resp);
          this.logService.snackBarError(resp, 4000);
        }
      });
    }
  }

  setDefaultFormValues(options: TaggerOptions) {
    const taggerForm = this.taggerGroupForm.get('taggerForm');
    if (taggerForm) {
      const vectorizer = taggerForm.get('vectorizerFormControl');
      if (vectorizer) {
        vectorizer.setValue(options.actions.POST.vectorizer.choices[0]);
      }
      const classifier = taggerForm.get('classifierFormControl');
      if (classifier) {
        classifier.setValue(options.actions.POST.classifier.choices[0]);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LogService} from '../../../core/util/log.service';
import {ElasticAnalyzerService} from '../../../core/tools/elastic-analyzer/elastic-analyzer.service';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: string[];
  detectLangFormControl: boolean;
  stripHtmlFormControl: boolean;
  languageFormControl: string;
  esTimeoutFormControl: number;
  bulkSizeFormControl: number;
  tokenizerFormControl: string[];
  analyzersFormControl: string[];
}

@Component({
  selector: 'app-create-elastic-analyzer-dialog',
  templateUrl: './create-elastic-analyzer-dialog.component.html',
  styleUrls: ['./create-elastic-analyzer-dialog.component.scss']
})
export class CreateElasticAnalyzerDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query: unknown = this.defaultQuery;

  elasticAnalyzerForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    languageFormControl: new UntypedFormControl(''),
    analyzersFormControl: new UntypedFormControl([], [Validators.required]),
    tokenizerFormControl: new UntypedFormControl(),
    detectLangFormControl: new UntypedFormControl(''),
    stripHtmlFormControl: new UntypedFormControl(false),
    esTimeoutFormControl: new UntypedFormControl(25),
    bulkSizeFormControl: new UntypedFormControl(100),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  stemmerLangs: {
    value: string;
    display_name: string;
  }[];
  analyzers: {
    value: string;
    display_name: string;
  }[];
  tokenizers: {
    value: string;
    display_name: string;
  }[];
  // tslint:disable-next-line:no-any
  elasticAnalyzerOptions: any | unknown;
  requiredValidator = Validators.required;
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateElasticAnalyzerDialogComponent>,
              private projectService: ProjectService,
              private elasticAnalyzerService: ElasticAnalyzerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.elasticAnalyzerForm.get('detectLangFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.elasticAnalyzerForm.get('languageFormControl')?.disable({emitEvent: false});
      } else {
        this.elasticAnalyzerForm.get('languageFormControl')?.enable({emitEvent: false});
      }
    });

    this.elasticAnalyzerForm.get('languageFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.elasticAnalyzerForm.get('detectLangFormControl')?.disable({emitEvent: false});
      } else {
        this.elasticAnalyzerForm.get('detectLangFormControl')?.enable({emitEvent: false});
      }
    });

    this.elasticAnalyzerForm.get('analyzersFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val.length > 0 && val.includes('stemmer')) {
        this.elasticAnalyzerForm.get('languageFormControl')?.setValidators([Validators.required]);
      } else {
        this.elasticAnalyzerForm.get('languageFormControl')?.clearValidators();
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.elasticAnalyzerForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject && currentProject.id) {
        this.currentProject = currentProject;
        return this.elasticAnalyzerService.getElasticAnalyzerOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.elasticAnalyzerOptions = resp;
        this.stemmerLangs = resp.actions.POST.stemmer_lang.choices.sort((a, b) => a.value.localeCompare(b.value));
        this.analyzers = resp.actions.POST.analyzers.choices;
        this.tokenizers = resp.actions.POST.tokenizer.choices;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    this.createRequestInProgress = true;
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      ...formData.languageFormControl ? {stemmer_lang: formData.languageFormControl} : {},
      ...formData.detectLangFormControl ? {detect_lang: formData.detectLangFormControl} : {},
      analyzers: formData.analyzersFormControl,
      es_timeout: formData.esTimeoutFormControl,
      ...formData.tokenizerFormControl ? {tokenizer: formData.tokenizerFormControl} : {},
      bulk_size: formData.bulkSizeFormControl,
      strip_html: formData.stripHtmlFormControl,
      ...this.query ? {query: this.query} : {},
    };


    this.elasticAnalyzerService.createElasticAnalyzerTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
      this.createRequestInProgress = false;
    });
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.elasticAnalyzerForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(indicesForm.value, ['text'], []);
    }
  }

  onQueryChanged(query: unknown): void {
    this.query = query ? query : this.defaultQuery;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

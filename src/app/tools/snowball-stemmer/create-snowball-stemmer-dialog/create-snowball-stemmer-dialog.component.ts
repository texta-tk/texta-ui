import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LogService} from '../../../core/util/log.service';
import {SnowballStemmerService} from '../../../core/tools/snowball-stemmer/snowball-stemmer.service';

interface OnSubmitParams {
  descriptionFormControl: string;
  indicesFormControl: ProjectIndex[];
  fieldsFormControl: string[];
  detectLangFormControl: boolean;
  languageFormControl: string;
  esTimeoutFormControl: number;
  bulkSizeFormControl: number;
}

@Component({
  selector: 'app-create-snowball-stemmer-dialog',
  templateUrl: './create-snowball-stemmer-dialog.component.html',
  styleUrls: ['./create-snowball-stemmer-dialog.component.scss']
})
export class CreateSnowballStemmerDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query: unknown = this.defaultQuery;

  snowballStemmerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    indicesFormControl: new FormControl([], [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    languageFormControl: new FormControl('', [Validators.required]),
    detectLangFormControl: new FormControl(''),
    esTimeoutFormControl: new FormControl(25),
    bulkSizeFormControl: new FormControl(100),
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

  constructor(private dialogRef: MatDialogRef<CreateSnowballStemmerDialogComponent>,
              private projectService: ProjectService,
              private snowballStemmerService: SnowballStemmerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.snowballStemmerForm.get('detectLangFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.snowballStemmerForm.get('languageFormControl')?.disable({emitEvent: false});
      } else {
        this.snowballStemmerForm.get('languageFormControl')?.enable({emitEvent: false});
      }
    });

    this.snowballStemmerForm.get('languageFormControl')?.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      if (val) {
        this.snowballStemmerForm.get('detectLangFormControl')?.disable({emitEvent: false});
      } else {
        this.snowballStemmerForm.get('detectLangFormControl')?.enable({emitEvent: false});
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.snowballStemmerForm.get('indicesFormControl');
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
        return this.snowballStemmerService.getSnowballStemmerOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.stemmerLangs = resp.actions.POST.stemmer_lang.choices;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      stemmer_lang: formData.languageFormControl,
      ...formData.detectLangFormControl ? {detect_lang: formData.detectLangFormControl} : {},
      es_timeout: formData.esTimeoutFormControl,
      bulk_size: formData.bulkSizeFormControl,
      ...this.query ? {query: this.query} : {},
    };


    this.snowballStemmerService.createSnowballStemmerTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.snowballStemmerForm.get('indicesFormControl');
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

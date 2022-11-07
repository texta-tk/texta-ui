import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Lexicon} from '../../../../shared/types/Lexicon';
import {LogService} from '../../../../core/util/log.service';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../../core/projects/project.store';
import {MatMenuTrigger} from '@angular/material/menu';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../../../shared/types/Project';
import {AnnotatorService} from '../../../../core/tools/annotator/annotator.service';
import {ProjectService} from '../../../../core/projects/project.service';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';

interface OnSubmitParams {
  categoryFormControl: string;
  valuesFormControl: string;
  valueLimitFormControl: number;
  indicesFormControl: ProjectIndex[];
  factNameFormControl: string[];
}

@Component({
  selector: 'app-create-labelset-dialog',
  templateUrl: './create-labelset-dialog.component.html',
  styleUrls: ['./create-labelset-dialog.component.scss']
})
export class CreateLabelsetDialogComponent implements OnInit, OnDestroy {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  labelSetForm = new UntypedFormGroup({
    indicesFormControl: new UntypedFormControl([]),
    categoryFormControl: new UntypedFormControl('', [Validators.required]),
    factNameFormControl: new UntypedFormControl(),
    valueLimitFormControl: new UntypedFormControl(500, [Validators.required, Validators.max(10000), Validators.min(0)]),
    valuesFormControl: new UntypedFormControl(''),
  });
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  // tslint:disable-next-line:no-any
  labelSetOptions: any;
  projectIndices: ProjectIndex[] = [];

  projectFacts: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['Loading...']);
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateLabelsetDialogComponent>,
              private logService: LogService,
              private projectService: ProjectService,
              private lexiconService: LexiconService,
              private annotatorService: AnnotatorService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          options: this.annotatorService.getLabelSetOptions(currentProject.id),
          projectIndices: this.projectStore.getProjectIndices().pipe(take(1)),
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp?.options && !(resp?.options instanceof HttpErrorResponse)) {
        this.labelSetOptions = resp.options;
      }

      if (resp?.projectIndices && !(resp.projectIndices instanceof HttpErrorResponse)) {
        this.projectIndices = resp.projectIndices;
      }

      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });

    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
      if (this.currentProject?.id && currentProjIndices) {
        const indicesForm = this.labelSetForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFacts.next(['Loading...']);
        return this.projectService.getProjectFacts(this.currentProject.id, currentProjIndices.map(x => [{name: x.index}]).flat(), false, false);
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

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.labelSetForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value) {
      this.getFactsForIndices(indicesForm?.value);
    }
  }

  getFactsForIndices(val: ProjectIndex[]): void {
    if (val.length > 0) {
      this.projectFacts.next(['Loading...']);
      this.projectService.getProjectFacts(this.currentProject.id, val.map((x: ProjectIndex) => [{name: x.index}]).flat(), false, false).subscribe(resp => {
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

  onSubmit(formData: OnSubmitParams): void {
    this.createRequestInProgress = true;
    const body = {
      category: formData.categoryFormControl,
      value_limit: formData.valueLimitFormControl,
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [x.index]).flat(),
      ...formData.factNameFormControl ? {fact_names: formData.factNameFormControl} : {},
      values: formData.valuesFormControl.length > 0 ? formData.valuesFormControl.split('\n').filter((x: unknown) => x) : [],
    };
    this.annotatorService.createLabelSet(this.currentProject.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.dialogRef.close(x);
      } else {
        if (x.error.hasOwnProperty('values')) {
          this.logService.snackBarMessage(x.error.values.join(','), 5000);
        } else {
          this.logService.snackBarError(x);
        }
      }
      this.createRequestInProgress = false;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

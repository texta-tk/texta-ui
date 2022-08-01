import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MLPService} from '../../../core/tools/mlp/mlp.service';
import {mergeMap, takeUntil} from 'rxjs/operators';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {HttpErrorResponse} from '@angular/common/http';
import {Choice, MLPOptions} from '../../../shared/types/tasks/MLPOptions';
import {MLP} from '../../../shared/types/tasks/MLP';

@Component({
  selector: 'app-mlp-create-index-dialog',
  templateUrl: './mlp-create-index-dialog.component.html',
  styleUrls: ['./mlp-create-index-dialog.component.scss']
})
export class MLPCreateIndexDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query: unknown = this.defaultQuery;

  MLPForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    analyzersFormControl: new UntypedFormControl([], [Validators.required]),
    esTimeoutFormControl: new UntypedFormControl(30),
    esScrollSizeFormControl: new UntypedFormControl(100),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  projectFields: ProjectIndex[];
  analyzers: Choice[] = [];
  // tslint:disable-next-line:no-any
  mlpOptions: any;

  constructor(private dialogRef: MatDialogRef<MLPCreateIndexDialogComponent>,
              private projectService: ProjectService,
              private mlpService: MLPService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.MLPForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(currentProjIndices, ['text'], []);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.mlpService.getMLPOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: MLPOptions | HttpErrorResponse | null) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.mlpOptions = resp;
        this.analyzers = resp.actions.POST.analyzers.choices || [];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formData: {
    descriptionFormControl: string;
    indicesFormControl: ProjectIndex[]; fieldsFormControl: string[]; analyzersFormControl: string[]; esTimeoutFormControl: number; esScrollSizeFormControl: number;
  }): void {
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      fields: formData.fieldsFormControl,
      analyzers: formData.analyzersFormControl,
      ...this.query ? {query: this.query} : {},
      es_timeout: formData.esTimeoutFormControl,
      es_scroll_size: formData.esScrollSizeFormControl,
    };

    this.mlpService.createMLPTask(this.currentProject.id, body).subscribe((resp: MLP | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new MLP worker: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.MLPForm.get('indicesFormControl');
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

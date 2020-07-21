import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {Choice, MLPOptions} from '../../../shared/types/tasks/MLPOptions';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {MLPService} from '../../../core/tools/mlp/mlp.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';

@Component({
  selector: 'app-mlp-apply-text-dialog',
  templateUrl: './mlp-apply-text-dialog.component.html',
  styleUrls: ['./mlp-apply-text-dialog.component.scss']
})
export class MLPApplyTextDialogComponent implements OnInit, OnDestroy {

  analyzers: Choice[];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  MLPForm = new FormGroup({
    textFormControl: new FormControl('', [Validators.required]),
    analyzersFormControl: new FormControl([], [Validators.required]),
  });
  currentProject: Project;
  result: any;
  isLoading: boolean;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<MLPApplyTextDialogComponent>,
              private projectService: ProjectService,
              private mlpService: MLPService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.mlpService.getMLPOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: MLPOptions | HttpErrorResponse | null) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.analyzers = resp.actions.POST.analyzers.choices;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formGroup: { analyzersFormControl: string[]; textFormControl: string; }) {
    this.isLoading = true;
    this.mlpService.applyMLPText({
      analyzers: formGroup.analyzersFormControl,
      texts: [formGroup.textFormControl]
    }).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.result = x;
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 2000);
      }
    }, () => {
    }, () => this.isLoading = false);
  }


  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

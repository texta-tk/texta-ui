import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Project} from '../../../shared/types/Project';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {MLPService} from '../../../core/tools/mlp/mlp.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {SummarizerService} from '../../../core/tools/summarizer/summarizer.service';

@Component({
  selector: 'app-apply-summarizer-dialog',
  templateUrl: './apply-summarizer-dialog.component.html',
  styleUrls: ['./apply-summarizer-dialog.component.scss']
})
export class ApplySummarizerDialogComponent implements OnInit, OnDestroy {


  algorithms: {
    value: string;
    display_name: string;
  }[];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  summarizerForm = new FormGroup({
    textFormControl: new FormControl('', [Validators.required]),
    algorithmsFormControl: new FormControl([]),
    ratioFormControl: new FormControl(0.2)
  });
  currentProject: Project;
  result: { lexrank: string; textrank: string };
  isLoading: boolean;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<ApplySummarizerDialogComponent>,
              private projectService: ProjectService,
              private summarizerService: SummarizerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.summarizerService.getSummarizerOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.algorithms = resp.actions.POST.algorithm.choices;
        this.summarizerForm.get('algorithmsFormControl')?.setValue([this.algorithms.find(x => x.display_name === 'lexrank')?.value || this.algorithms[0]?.value]);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formGroup: { algorithmsFormControl: string[]; textFormControl: string; ratioFormControl: number }): void {
    this.isLoading = true;
    this.summarizerService.applySummarizerText(this.currentProject.id, {
      algorithm: formGroup.algorithmsFormControl,
      text: formGroup.textFormControl,
      ratio: formGroup.ratioFormControl
    }).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.result = x[0];
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 2000);
      }
    }, () => {
    }, () => this.isLoading = false);
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

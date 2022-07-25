import {
  AfterViewInit,
  Component, ElementRef,
  Inject,
  OnDestroy,
  OnInit, ViewChild,
} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../shared/types/Project';
import {Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {AnonymizerService} from '../anonymizer.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {takeUntil} from 'rxjs/operators';
import {Anonymizer} from '../types/Anonymizer';
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-anonymize-text-dialog',
  templateUrl: './anonymize-text-dialog.component.html',
  styleUrls: ['./anonymize-text-dialog.component.scss']
})
export class AnonymizeTextDialogComponent implements OnInit, OnDestroy {
  anonymizerForm: UntypedFormGroup = new UntypedFormGroup({
    textFormControl: new UntypedFormControl('', [Validators.required]),
    namesFormControl: new UntypedFormControl('', [Validators.required]),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  anonymizedText: string;
  @ViewChild('textarea') textArea: ElementRef;

  constructor(private dialogRef: MatDialogRef<AnonymizeTextDialogComponent>,
              private projectService: ProjectService,
              @Inject(MAT_DIALOG_DATA) public data: Anonymizer,
              private logService: LogService,
              private anonymizerService: AnonymizerService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.currentProject = x;
      }
    });
  }

  onSubmit(formData: { [key: string]: string }): void {
    const body = {
      text: formData.textFormControl,
      names: formData.namesFormControl.trim().split('\n'),
    };
    this.anonymizerService.anonymizeText(this.currentProject.id, this.data.id, body).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else {
        this.anonymizedText = resp;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

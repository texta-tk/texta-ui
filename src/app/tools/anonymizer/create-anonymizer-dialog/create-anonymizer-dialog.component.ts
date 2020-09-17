import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {AnonymizerService} from '../anonymizer.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../shared/types/Project';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-create-anonymizer-dialog',
  templateUrl: './create-anonymizer-dialog.component.html',
  styleUrls: ['./create-anonymizer-dialog.component.scss']
})
export class CreateAnonymizerDialogComponent implements OnInit, OnDestroy {
  anonymizerForm: FormGroup = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    replaceMisspelledNamesFormControl: new FormControl(true),
    replaceSingleLastNamesFormControl: new FormControl(true),
    replaceSingleFirstNamesFormControl: new FormControl(true),
    // mimicCasingFormControl: new FormControl(true),
    misspellingThresholdFormControl: new FormControl(0.9, [
      Validators.required, Validators.min(0), Validators.max(1)]),
    autoAdjustThresholdFormControl: new FormControl(false),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<CreateAnonymizerDialogComponent>,
              private projectService: ProjectService,
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

  onSubmit(formData: { [key: string]: unknown }): void {
    // mimic_casing: formData.mimicCasingFormControl,
    const body = {
      description: formData.descriptionFormControl,
      replace_misspelled_names: formData.replaceMisspelledNamesFormControl,
      replace_single_last_names: formData.replaceSingleLastNamesFormControl,
      replace_single_first_names: formData.replaceSingleFirstNamesFormControl,
      misspelling_threshold: formData.misspellingThresholdFormControl,
      auto_adjust_threshold: formData.autoAdjustThresholdFormControl,
    };
    this.anonymizerService.createAnonymizer(this.currentProject.id, body).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else {
        this.dialogRef.close(resp);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

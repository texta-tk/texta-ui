import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
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
import {HttpErrorResponse} from '@angular/common/http';
import {Anonymizer} from '../types/Anonymizer';

@Component({
  selector: 'app-edit-anonymizer-dialog',
  templateUrl: './edit-anonymizer-dialog.component.html',
  styleUrls: ['./edit-anonymizer-dialog.component.scss']
})
export class EditAnonymizerDialogComponent implements OnInit, OnDestroy {
  anonymizerForm: FormGroup;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<EditAnonymizerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Anonymizer,
              private logService: LogService,
              private anonymizerService: AnonymizerService,
              private projectStore: ProjectStore) {
    if (this.data) {
      this.anonymizerForm = new FormGroup({
        descriptionFormControl: new FormControl(this.data.description, [Validators.required]),
        replaceMisspelledNamesFormControl: new FormControl(this.data.replace_misspelled_names),
        replaceSingleLastNamesFormControl: new FormControl(this.data.replace_single_last_names),
        replaceSingleFirstNamesFormControl: new FormControl(this.data.replace_single_first_names),
        mimicCasingFormControl: new FormControl(this.data.mimic_casing),
        misspellingThresholdFormControl: new FormControl(this.data.misspelling_threshold, [
          Validators.required, Validators.min(0), Validators.max(1)]),
        autoAdjustThresholdFormControl: new FormControl(this.data.auto_adjust_threshold),
      });
    }
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.currentProject = x;
      }
    });
  }

  onSubmit(formData: { [key: string]: unknown }): void {
    const body = {
      description: formData.descriptionFormControl,
      replace_misspelled_names: formData.replaceMisspelledNamesFormControl,
      replace_single_last_names: formData.replaceSingleLastNamesFormControl,
      replace_single_first_names: formData.replaceSingleFirstNamesFormControl,
      mimic_casing: formData.mimicCasingFormControl,
      misspelling_threshold: formData.misspellingThresholdFormControl,
      auto_adjust_threshold: formData.autoAdjustThresholdFormControl
    };
    this.anonymizerService.patchAnonymizer(this.currentProject.id, this.data.id, body).subscribe(resp => {
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

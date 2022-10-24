import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {of, Subject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {CoreService} from '../../../core/core.service';
import {ElasticIndexOptionsResponse} from 'src/app/shared/types/Index';
import {Choice} from '../../../shared/types/tasks/Embedding';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

interface OnSubmitParams {
  descriptionFormControl: string;
  nameFormControl: string;
  addedByFormControl: string;
  sourceFormControl: string;
  clientFormControl: string;
  domainFormControl: string;
  isTestFormControl: boolean;
  isOpenFormControl: boolean;
}

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.scss']
})
export class CreateDialogComponent implements OnInit, OnDestroy {
  createIndexForm = new FormGroup({
    nameFormControl: new FormControl('', [Validators.required, Validators.maxLength(255), UtilityFunctions.indexNameValidator]),
    descriptionFormControl: new FormControl('', [Validators.maxLength(255)]),
    addedByFormControl: new FormControl('', [Validators.maxLength(255)]),
    sourceFormControl: new FormControl('', [Validators.maxLength(255)]),
    clientFormControl: new FormControl('', [Validators.maxLength(255)]),
    domainFormControl: new FormControl('', [Validators.maxLength(255)]),
    isTestFormControl: new FormControl(false),
    isOpenFormControl: new FormControl(false),
  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  destroyed$: Subject<boolean> = new Subject<boolean>();

  indexOptions: ElasticIndexOptionsResponse | undefined;
  domains: Choice[] = [];
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateDialogComponent>,
              private coreService: CoreService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.coreService.getElasticIndicesOptions().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.indexOptions = resp;
        this.domains = resp.actions.POST.domain.choices;
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  onSubmit(): void {
    this.createRequestInProgress = true;
    const body = {
      name: this.createIndexForm.value.nameFormControl,
      is_open: this.createIndexForm.value.isOpenFormControl,
      test: this.createIndexForm.value.isTestFormControl,
      ...this.createIndexForm.value.descriptionFormControl ? {description: this.createIndexForm.value.descriptionFormControl} : {},
      ...this.createIndexForm.value.sourceFormControl ? {source: this.createIndexForm.value.sourceFormControl} : {},
      ...this.createIndexForm.value.clientFormControl ? {client: this.createIndexForm.value.clientFormControl} : {},
      ...this.createIndexForm.value.domainFormControl ? {domain: this.createIndexForm.value.domainFormControl} : {},
      ...this.createIndexForm.value.addedByFormControl ? {added_by: this.createIndexForm.value.addedByFormControl} : {}
    };
    this.coreService.createElasticIndex(body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

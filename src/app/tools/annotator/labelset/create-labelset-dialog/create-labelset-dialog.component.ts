import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Lexicon} from '../../../../shared/types/Lexicon';
import {LogService} from '../../../../core/util/log.service';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../../core/projects/project.store';
import {MatMenuTrigger} from '@angular/material/menu';
import {switchMap, takeUntil} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../../../shared/types/Project';
import {AnnotatorService} from '../../../../core/tools/annotator/annotator.service';

interface OnSubmitParams {
  categoryFormControl: string;
  valuesFormControl: string;
}

@Component({
  selector: 'app-create-labelset-dialog',
  templateUrl: './create-labelset-dialog.component.html',
  styleUrls: ['./create-labelset-dialog.component.scss']
})
export class CreateLabelsetDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  labelSetForm = new FormGroup({
    categoryFormControl: new FormControl('', [Validators.required]),
    valuesFormControl: new FormControl('', [Validators.required]),
  });
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  // tslint:disable-next-line:no-any
  labelSetOptions: any;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(private dialogRef: MatDialogRef<CreateLabelsetDialogComponent>,
              private logService: LogService,
              private lexiconService: LexiconService,
              private annotatorService: AnnotatorService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          options: this.annotatorService.getLabelSetOptions(currentProject.id)
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.options instanceof HttpErrorResponse)) {
          this.labelSetOptions = resp.options;
        }
      }
    });
  }

  onSubmit(formData: OnSubmitParams): void {
    const body = {
      category: formData.categoryFormControl,
      values: formData.valuesFormControl.length > 0 ? formData.valuesFormControl.split('\n').filter((x: unknown) => x) : [],
    };
    this.annotatorService.createLabelSet(this.currentProject.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.dialogRef.close(x);
      } else {
        if (x.error.hasOwnProperty('lexicon')) {
          this.logService.snackBarMessage(x.error.lexicon.join(','), 5000);
        } else {
          this.logService.snackBarError(x);
        }
      }
    });
  }
}

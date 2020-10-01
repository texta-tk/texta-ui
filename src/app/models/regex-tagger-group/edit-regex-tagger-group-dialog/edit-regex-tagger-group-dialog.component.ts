import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTaggerGroup} from '../../../shared/types/tasks/RegexTaggerGroup';

@Component({
  selector: 'app-edit-regex-tagger-group-dialog',
  templateUrl: './edit-regex-tagger-group-dialog.component.html',
  styleUrls: ['./edit-regex-tagger-group-dialog.component.scss']
})
export class EditRegexTaggerGroupDialogComponent implements OnInit, OnDestroy {

  regexTaggerGroupForm: FormGroup;

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectRegexTaggers: RegexTagger[] = [];

  constructor(private dialogRef: MatDialogRef<EditRegexTaggerGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RegexTaggerGroup,
              private projectService: ProjectService,
              private regexTaggerGroupService: RegexTaggerGroupService,
              private regexTaggerService: RegexTaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
    if (this.data) {
      this.regexTaggerGroupForm = new FormGroup({
        descriptionFormControl: new FormControl(this.data.description, [Validators.required]),
        regexTaggersFormControl: new FormControl(this.data.regex_taggers, [Validators.required])
      });
    }
  }

  ngOnInit(): void {

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.regexTaggerService.getRegexTaggers(proj.id);
      }
      return of(null);
    })).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.projectRegexTaggers = x.results;
      } else if (x) {
        this.logService.snackBarError(x);
      }
    });
  }

  onSubmit(formData: {
    descriptionFormControl: string;
    regexTaggersFormControl: RegexTagger[];
  }): void {
    const body = {
      description: formData.descriptionFormControl,
      regex_taggers: formData.regexTaggersFormControl
    };
    this.regexTaggerGroupService.patchRegexTaggerGroup(this.currentProject.id, this.data.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Edited Regex Tagger group: ${resp.description}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        if (resp.error.hasOwnProperty('lexicon')) {
        this.logService.snackBarMessage(resp.error.lexicon.join(','), 5000);
      } else {
        this.logService.snackBarError(resp);
      }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

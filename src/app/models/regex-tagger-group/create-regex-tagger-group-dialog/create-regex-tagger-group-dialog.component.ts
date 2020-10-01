import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {mergeMap, switchMap, takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {LogService} from '../../../core/util/log.service';
import {RegexTaggerService} from "../../../core/models/taggers/regex-tagger.service";
import {RegexTagger} from "../../../shared/types/tasks/RegexTagger";

@Component({
  selector: 'app-create-regex-tagger-group-dialog',
  templateUrl: './create-regex-tagger-group-dialog.component.html',
  styleUrls: ['./create-regex-tagger-group-dialog.component.scss']
})
export class CreateRegexTaggerGroupDialogComponent implements OnInit, OnDestroy {

  regexTaggerGroupForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    regexTaggersFormControl: new FormControl([], [Validators.required])
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectRegexTaggers: RegexTagger[] = [];

  constructor(private dialogRef: MatDialogRef<CreateRegexTaggerGroupDialogComponent>,
              private projectService: ProjectService,
              private regexTaggerGroupService: RegexTaggerGroupService,
              private regexTaggerService: RegexTaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
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
      regex_taggers: formData.regexTaggersFormControl.map(x => [x.id]).flat()
    };

    this.regexTaggerGroupService.createRegexTaggerGroupTask(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Created new task: ${resp.description}`, 2000);
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

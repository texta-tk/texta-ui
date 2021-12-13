import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Observable, of, Subject} from 'rxjs';
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
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {ResultsWrapper} from '../../../shared/types/Generic';

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

  projectRegexTaggers: ScrollableDataSource<RegexTagger>;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  regexTaggerGroupOptions: any;

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
        this.projectRegexTaggers = new ScrollableDataSource(this.fetchFn, this);
        return this.regexTaggerGroupService.getRegexTaggerGroupOptions(proj.id);
      }
      return of(null);
    })).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.regexTaggerGroupOptions = x;
      } else if (x) {
        this.logService.snackBarError(x);
      }
    });
  }

  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<RegexTagger> | HttpErrorResponse> {
    return context.regexTaggerService.getRegexTaggers(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
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

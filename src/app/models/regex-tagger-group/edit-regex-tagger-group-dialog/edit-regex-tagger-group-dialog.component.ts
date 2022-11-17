import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../shared/types/Project';
import {Observable, of, Subject} from 'rxjs';
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
import {ResultsWrapper} from '../../../shared/types/Generic';
import {ScrollableDataSource} from '@texta/ngx-virtual-scroll-mat-select';

@Component({
  selector: 'app-edit-regex-tagger-group-dialog',
  templateUrl: './edit-regex-tagger-group-dialog.component.html',
  styleUrls: ['./edit-regex-tagger-group-dialog.component.scss']
})
export class EditRegexTaggerGroupDialogComponent implements OnInit, OnDestroy {

  regexTaggerGroupForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl(this.data?.description || '', [Validators.required]),
    regexTaggersFormControl: new UntypedFormControl([], [Validators.required])
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  projectRegexTaggers: ScrollableDataSource<RegexTagger>;
  // tslint:disable-next-line:no-any
  regexTaggerGroupOptions: any;
  // number = projectId
  getFirstRegexTagger$: Subject<number> = new Subject();

  constructor(private dialogRef: MatDialogRef<EditRegexTaggerGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RegexTaggerGroup,
              private projectService: ProjectService,
              private regexTaggerGroupService: RegexTaggerGroupService,
              private regexTaggerService: RegexTaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {

  }

  ngOnInit(): void {
    this.getFirstRegexTagger$.pipe(takeUntil(this.destroyed$), switchMap(resp => {
      if (this.data?.regex_taggers.length > 0 && resp) {
        const ids = this.data.regex_taggers.flatMap(x => [{id: x}]);
        this.regexTaggerGroupForm.get('regexTaggersFormControl')?.setValue(ids);
        return this.regexTaggerService.getRegexTaggerById(resp, ids[0].id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        const form = this.regexTaggerGroupForm.get('regexTaggersFormControl');
        if (form) {
          const newVal = form.value;
          newVal[0] = resp;
          form.setValue(newVal);
        }
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        this.getFirstRegexTagger$.next(proj.id);
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

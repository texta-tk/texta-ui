import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Project} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTaggerGroup} from '../../../shared/types/tasks/RegexTaggerGroup';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';

@Component({
  selector: 'app-multi-tag-text-dialog',
  templateUrl: './multi-tag-text-dialog.component.html',
  styleUrls: ['./multi-tag-text-dialog.component.scss']
})
export class MultiTagTextDialogComponent implements OnInit, OnDestroy {
  text = '';
  taggers: RegexTaggerGroup[];
  selectedTaggers: RegexTaggerGroup[];

  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();

  result: unknown;
  isLoading: boolean;

  constructor(private dialogRef: MatDialogRef<MultiTagTextDialogComponent>,
              private regexTaggerGroupService: RegexTaggerGroupService,
              @Inject(MAT_DIALOG_DATA) public data: RegexTaggerGroup[],
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {

  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(project => {
      if (project) {
        this.currentProject = project;
        return this.regexTaggerGroupService.getRegexTaggerGroupTasks(project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.taggers = resp.results;
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  onSubmit(text: string, selectedTaggers: RegexTaggerGroup[]): void {
    const body = {
      text,
      taggers: selectedTaggers?.map(x => x.id) || [],
    };
    this.isLoading = true;
    this.regexTaggerGroupService.multiTagText(this.currentProject.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.result = x;
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 2000);
        this.result = undefined;
      }
    }, () => {
    }, () => this.isLoading = false);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

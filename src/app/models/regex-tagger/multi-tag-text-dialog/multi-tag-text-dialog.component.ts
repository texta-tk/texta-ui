import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-multi-tag-text-dialog',
  templateUrl: './multi-tag-text-dialog.component.html',
  styleUrls: ['./multi-tag-text-dialog.component.scss']
})
export class MultiTagTextDialogComponent implements OnInit, OnDestroy {
  text = '';
  taggers: RegexTagger[];
  selectedTaggers: RegexTagger[];

  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();

  result: unknown;
  isLoading: boolean;
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;

  constructor(private dialogRef: MatDialogRef<MultiTagTextDialogComponent>,
              private regexTaggerService: RegexTaggerService,
              @Inject(MAT_DIALOG_DATA) public data: RegexTagger[],
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {
    this.taggers = data;
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap((currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.regexTaggerService.getMultiTagTextOptions(currentProject.id);
      }
      return of(null);
    }))).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.regexTaggerOptions = resp;
      }
    });

  }

  onSubmit(text: string, selectedTaggers: RegexTagger[]): void {
    const body = {
      text,
      taggers: selectedTaggers?.map(x => x.id) || [],
    };
    this.isLoading = true;
    this.regexTaggerService.multiTagText(this.currentProject.id, body).subscribe(x => {
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

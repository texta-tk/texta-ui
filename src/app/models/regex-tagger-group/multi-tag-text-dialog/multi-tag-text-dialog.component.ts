import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Project} from '../../../shared/types/Project';
import {Observable, of, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {
  Match,
  RegexTaggerGroup,
  RegexTaggerGroupMultiTagTextResult
} from '../../../shared/types/tasks/RegexTaggerGroup';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {HighlightSettings} from '../../../shared/SettingVars';
import {LegibleColor} from '../../../shared/UtilityFunctions';

type CustomMatch = {
  spans: string;
  fact: string;
  str_val: string;
  doc_path: string;
  tagger_id: number;
  tagger_tag: string;
  tagger_group_tag: string;
};

@Component({
  selector: 'app-multi-tag-text-dialog',
  templateUrl: './multi-tag-text-dialog.component.html',
  styleUrls: ['./multi-tag-text-dialog.component.scss']
})
export class MultiTagTextDialogComponent implements OnInit, OnDestroy {
  text = '';
  taggers: ScrollableDataSource<RegexTaggerGroup>;
  selectedTaggers: RegexTaggerGroup[];

  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  colorMap: Map<string, LegibleColor> = new Map();
  defaultColors = HighlightSettings.legibleColors;

  result: RegexTaggerGroupMultiTagTextResult[] | undefined;
  isLoading: boolean;
  // tslint:disable-next-line:no-any
  highlightData: Partial<{ text: string, texta_facts: any[] }> = {};
  taggerIdAccessor = (x: CustomMatch) => 'Regex Tagger Group: ' + x.tagger_group_tag + '\n' +
    'Regex Tagger: ' + x.tagger_tag + '\n' +
    'Regex Tagger id: ' + x.tagger_id

  constructor(private dialogRef: MatDialogRef<MultiTagTextDialogComponent>,
              private regexTaggerGroupService: RegexTaggerGroupService,
              @Inject(MAT_DIALOG_DATA) public data: RegexTaggerGroup[],
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {

  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(project => {
      if (project) {
        this.currentProject = project;
        this.taggers = new ScrollableDataSource(this.fetchFn, this);
      }
    });
  }

  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<RegexTaggerGroup> | HttpErrorResponse> {
    return context.regexTaggerGroupService.getRegexTaggerGroupTasks(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
  }

  onSubmit(text: string, selectedTaggers: RegexTaggerGroup[]): void {
    const body = {
      text,
      tagger_groups: selectedTaggers?.map(x => x.id) || [],
    };
    this.isLoading = true;
    this.regexTaggerGroupService.multiTagText(this.currentProject.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.result = x;
        for (let i = 0; i < this.result.length; i++) {
          let color;
          if (this.defaultColors.length > i) {
            color = this.defaultColors[i];
          } else {
            color = {
              // tslint:disable-next-line:no-bitwise
              backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
              textColor: 'black'
            };
          }
          this.colorMap.set(this.result[i].tagger_group_tag, color);
        }

        this.highlightData = {text, texta_facts: this.constructHighlightSpans(this.result)};
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


  private constructHighlightSpans(result: RegexTaggerGroupMultiTagTextResult[]): CustomMatch[] {
    const matchesList: CustomMatch[] = [];
    result.forEach(group => {
      group.tags.forEach(tagger => {
        tagger.matches.forEach(match => {
          matchesList.push({
            spans: JSON.stringify(match.span),
            fact: group.tagger_group_tag,
            str_val: match.str_val,
            doc_path: 'text',
            tagger_id: tagger.tagger_id,
            tagger_tag: tagger.tag,
            tagger_group_tag: group.tagger_group_tag
          });
        });
      });
    });
    return matchesList;
  }
}

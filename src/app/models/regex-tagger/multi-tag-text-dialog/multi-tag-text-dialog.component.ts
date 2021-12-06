import {ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';
import {forkJoin, Observable, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {LegibleColor, UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {FormControl} from '@angular/forms';
import {HighlightSettings} from "../../../shared/SettingVars";
import {RegexTaggerGroupMultiTagTextResult, Tag} from "../../../shared/types/tasks/RegexTaggerGroup";

type CustomMatch = {
  spans: string;
  fact: string;
  str_val: string;
  doc_path: string;
  tagger_id: number;
  tagger_tag: string;
};

@Component({
  selector: 'app-multi-tag-text-dialog',
  templateUrl: './multi-tag-text-dialog.component.html',
  styleUrls: ['./multi-tag-text-dialog.component.scss']
})
export class MultiTagTextDialogComponent implements OnInit, OnDestroy {
  text = '';
  taggers: ScrollableDataSource<RegexTagger>;
  taggerSelectionFormControl = new FormControl([]);
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();

  result: Tag[] | undefined;
  isLoading: boolean;
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;
  colorMap: Map<string, LegibleColor> = new Map();
  defaultColors = HighlightSettings.legibleColors;
  highlightData: Partial<{ text: string, texta_facts: CustomMatch[] }> = {};
  taggerIdAccessor = (x: CustomMatch) => 'Regex Tagger: ' + x.tagger_tag + '\n' +
    'Regex Tagger id: ' + x.tagger_id

  constructor(private dialogRef: MatDialogRef<MultiTagTextDialogComponent>,
              private regexTaggerService: RegexTaggerService,
              private changeDetectorRef: ChangeDetectorRef,
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {
  }


  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap((currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        this.taggers = new ScrollableDataSource(this.fetchFn, this);
        return forkJoin({
          options: this.regexTaggerService.getMultiTagTextOptions(currentProject.id),
        });
      }
      return of(null);
    }))).subscribe(resp => {
      if (resp?.options && !(resp.options instanceof HttpErrorResponse)) {
        this.regexTaggerOptions = resp.options;
      }
      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });
  }

  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<RegexTagger> | HttpErrorResponse> {
    return context.regexTaggerService.getRegexTaggers(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
  }

  onSubmit(text: string): void {
    this.isLoading = true;
    const body = {
      text,
      taggers: this.taggerSelectionFormControl.value?.map((x: { id: number; }) => x.id) || [],
    };
    this.regexTaggerService.multiTagText(this.currentProject.id, body).subscribe(x => {
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
          this.colorMap.set(this.result[i].tag, color);
        }

        this.highlightData = {text, texta_facts: this.constructHighlightSpans(this.result)};
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 2000);
        this.result = undefined;
      }
      this.isLoading = false;
    });
  }

  private constructHighlightSpans(result: Tag[]): CustomMatch[] {
    const matchesList: CustomMatch[] = [];
    result.forEach(tagger => {
      tagger.matches.forEach(match => {
        matchesList.push({
          spans: JSON.stringify(match.span),
          fact: tagger.tag,
          str_val: match.str_val,
          doc_path: 'text',
          tagger_id: tagger.tagger_id,
          tagger_tag: tagger.tag,
        });
      });
    });
    return matchesList;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

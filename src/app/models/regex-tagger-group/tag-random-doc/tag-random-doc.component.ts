import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {
  Match,
  RegexTaggerGroup,
  RegexTaggerGroupTagRandomDocResult, RegexTaggerGroupTagTextResult,
} from '../../../shared/types/tasks/RegexTaggerGroup';
import {filter, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ProjectStore} from '../../../core/projects/project.store';
import {HighlightSettings} from '../../../shared/SettingVars';
import {SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-tag-random-doc',
  templateUrl: './tag-random-doc.component.html',
  styleUrls: ['./tag-random-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagRandomDocComponent implements OnInit, OnDestroy {
  fields: string[] = [];
  result: RegexTaggerGroupTagRandomDocResult;
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  projectIndices: ProjectIndex[];
  fieldsUnique: Field[] = [];
  defaultColors = HighlightSettings.legibleColors;
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  distinctMatches: Match[];
  fieldsWithMatches: string[];
  resultFields: string[];
  firstTimeTaggingOverFields = true;
  projectFields: ProjectIndex[] = [];
  selection = new SelectionModel<number | string>(true, [0, 1]);

  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;

  constructor(private regexTaggerGroupService: RegexTaggerGroupService, private logService: LogService,
              private projectStore: ProjectStore,
              private changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTaggerGroup; }) {
  }

  taggerIdAccessor = (x: Match) => 'regex tagger id: ' + JSON.parse(x.source)?.regextagger_id;

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });

    this.regexTaggerGroupService.getTagRdocOptions(this.data.currentProjectId, this.data.tagger.id).pipe(
      takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.regexTaggerOptions = resp;
      }
    });

    this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.model.indices = x;
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
      }
    });
  }


  public indicesOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && this.model.indices && !UtilityFunctions.arrayValuesEqual(this.model.indices, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
    }
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        indices: this.model.indices.map(x => [{name: x.index}]).flat(),
        fields: this.model.fields
      };
      this.regexTaggerGroupService.tagRandomDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          this.result.matches.forEach(match => {
            match.fact = match.str_val;
          });
          // replace texta_facts with matches array
          const textaFacts = 'texta_facts';
          this.result.document[textaFacts] = this.result.matches;
          this.resultFields = Object.keys(x.document);
          this.distinctMatches = this.getDistinctMatches(this.result);
          this.fieldsWithMatches = UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.doc_path)).map(y => y.doc_path);
          this.resultFields.sort((a, b) => this.fieldsWithMatches.includes(a) ? -1 : 0);

          if (this.firstTimeTaggingOverFields) {
            this.firstTimeTaggingOverFields = false;
            this.model.fields.forEach(field => {
              const fieldSelected = this.resultFields.find(y => y === field);
              if (fieldSelected && !this.selection.isSelected(fieldSelected)) {
                this.selection.toggle(fieldSelected);
              }
            });
          }

          this.uniqueFacts = this.getUniqueFacts(this.result.matches);
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  getUniqueFacts(matches: Match[]): { fact: Match; textColor: string; backgroundColor: string }[] {
    const returnVal: { fact: Match, textColor: string, backgroundColor: string }[] = [];
    const uniques = UtilityFunctions.getDistinctByProperty(matches, (y => y.fact));
    for (let i = 0; i < uniques.length; i++) {
      if (i < this.defaultColors.length) {
        const color = this.defaultColors[i];
        this.colorMap.set(uniques[i].fact, color);
        returnVal.push({
          fact: uniques[i],
          backgroundColor: color.backgroundColor,
          textColor: color.textColor
        });
      } else {
        const color = {
          // tslint:disable-next-line:no-bitwise
          backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
          textColor: 'black'
        };
        this.colorMap.set(uniques[i].fact, color);
        returnVal.push({
          fact: uniques[i],
          backgroundColor: color.backgroundColor,
          textColor: color.textColor
        });
      }
    }
    return returnVal;
  }

  getDistinctMatches(data: RegexTaggerGroupTagRandomDocResult): Match[] {
    data.matches.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });
    // remove document wide facts and empty facts (facts that have same span start and end index)
    const matches = data.matches.filter(x => x.spans[0] !== x.spans[1]);
    matches.sort(this.sortByStartLowestSpan);
    let previousMatch: Match | undefined;
    for (const match of matches) {
      previousMatch = match.doc_path !== previousMatch?.doc_path ? undefined : previousMatch;
      const matchSpans: number[] = match.spans as number[];
      const colContent = (data.document[match.doc_path] as number | string | object).toString();
      if (colContent) {
        match.str_val = colContent.substr(matchSpans[0], matchSpans[1] - matchSpans[0]);
        if (previousMatch === undefined || previousMatch.spans[0] !== match.spans[0] && previousMatch.spans[1] !== match.spans[1]) {
          previousMatch = match;
        } else if (match && previousMatch) {
          const src = JSON.parse(previousMatch.source);
          const matchSrc = JSON.parse(match.source);
          if (src.hasOwnProperty('regextagger_id') && matchSrc.hasOwnProperty('regextagger_id')) {
            src.regextagger_id = src.regextagger_id + ', ' + matchSrc.regextagger_id;
            previousMatch.source = JSON.stringify(src);
          }
        }
      }
    }
    return UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.str_val));
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private sortByStartLowestSpan(a: Match, b: Match): -1 | 1 {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }
}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {debounceTime, filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ProjectStore} from '../../../core/projects/project.store';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {Match, RegexTaggerTagRandomDocResult} from '../../../shared/types/tasks/RegexTaggerGroup';
import {HighlightSettings} from '../../../shared/SettingVars';
import {SelectionModel} from '@angular/cdk/collections';
import {of, Subject} from 'rxjs';

@Component({
  selector: 'app-tag-random-doc',
  templateUrl: './tag-random-doc.component.html',
  styleUrls: ['./tag-random-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagRandomDocComponent implements OnInit, OnDestroy {
  fields: string[] = [];
  result: RegexTaggerTagRandomDocResult;
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  defaultColors = HighlightSettings.legibleColors;
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  distinctMatches: Match[];
  resultFields: string[];
  selection = new SelectionModel<number | string>(true, [0, 1]);
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;
  selectedFields: string[];

  constructor(private regexTaggerService: RegexTaggerService, private logService: LogService,
              private projectStore: ProjectStore,
              private changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTagger; }) {
  }

  taggerIdAccessor = (x: Match) => '';

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });
    this.regexTaggerService.getRDocOptions(this.data.currentProjectId, this.data.tagger.id).pipe(
      takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.regexTaggerOptions = resp;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.model.indices = x;
        this.projectFields = ProjectIndex.filterFields(this.model.indices, [], ['fact']);
      }
    });
  }

  public indicesOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && this.model.indices && !UtilityFunctions.arrayValuesEqual(this.model.indices, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.filterFields(this.model.indices, [], ['fact']);
    }
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        indices: this.model.indices.map(x => [{name: x.index}]).flat(),
        fields: this.model.fields
      };
      this.regexTaggerService.tagRandomDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          // replace texta_facts with matches array
          const textaFacts = 'texta_facts';
          this.result.document[textaFacts] = this.result.matches;
          this.resultFields = Object.keys(x.document);
          this.distinctMatches = UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.str_val));
          this.resultFields.sort((a, b) => this.model.fields.includes(a) ? -1 : 0);

          // make selected fields open the accordion panels by default
          if (this.selectedFields !== this.model.fields) {
            this.selectedFields = this.model.fields;
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
    const uniques = UtilityFunctions.getDistinctByProperty(matches, (y => y.tagger_id));
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

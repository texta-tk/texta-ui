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

@Component({
  selector: 'app-tag-random-doc',
  templateUrl: './tag-random-doc.component.html',
  styleUrls: ['./tag-random-doc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagRandomDocComponent implements OnInit {
  fields: string[] = [];
  result: RegexTaggerTagRandomDocResult;
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
  selection = new SelectionModel<number | string>(true, [0, 1]);

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

  }

  getFieldsForIndices(indices: ProjectIndex[]): void {
    indices = ProjectIndex.cleanProjectIndicesFields(indices, [], ['fact'], true);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(indices.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && this.model.indices.length > 0) {
      this.getFieldsForIndices(this.model.indices);
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
}

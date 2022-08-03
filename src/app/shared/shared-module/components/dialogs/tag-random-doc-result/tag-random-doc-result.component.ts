import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {HighlightSettings} from '../../../../SettingVars';
import {UtilityFunctions} from '../../../../UtilityFunctions';
import {Match} from '../../../../types/tasks/RegexTaggerGroup';

@Component({
  selector: 'app-tag-random-doc-result',
  templateUrl: './tag-random-doc-result.component.html',
  styleUrls: ['./tag-random-doc-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagRandomDocResultComponent implements OnInit {

  // tslint:disable-next-line:no-any
  result: any;
  selection = new SelectionModel<number | string>(true, [0, 1]);
  destroyed$: Subject<boolean> = new Subject<boolean>();
  defaultColors = HighlightSettings.legibleColors;
  distinctMatches: Match[];
  resultFields: string[];
  uniqueFacts: {
    fact: Match, textColor: string, backgroundColor: string
  }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  fieldsChanged: boolean;
  selectedFields: string[];
  taggerIdAccessor = '';
  // tslint:disable-next-line:no-any
  hoverTooltip: any;

  // tslint:disable-next-line:no-any
  @Input() set tagRandomDocResult(val: { result: { document: any, matches?: any[], predictionTags?: any[] }, fields: string[], tooltipAccessor: (x: any) => string, taggerIdAccessor: string }) {
    this.colorMap = new Map();
    if (val.result && val.fields) {
      this.taggerIdAccessor = val.taggerIdAccessor;
      this.result = val.result;
      this.hoverTooltip = val.tooltipAccessor;
      this.resultFields = Object.keys(val.result.document);
      this.resultFields.sort((a, b) => val.fields.includes(a) ? -1 : 0);
      // prediction tags are missing, its a matches type tag random doc result (highligh entities)
      if (!val?.result?.predictionTags) {
        // replace texta_facts with matches array
        const textaFacts = 'texta_facts';
        this.result.document[textaFacts] = this.result.matches;
        this.distinctMatches = this.getDistinctMatches(this.result);

        if (this.result.matches) {
          this.uniqueFacts = this.getUniqueFacts(this.result.matches);
        }
      } else { // if prediction tags exist, its a binary tagger type result
        const predicted: Match[] = [];
        val.result.predictionTags?.forEach(x => {
          if (x.tag) { // 2 types of binary tagger result formats, Grouped and non grouped
            predicted.push({
              fact: `${x.hasOwnProperty('result') ? x.tag + ': ' + x.result : x.tag} (${Math.round((x.probability + Number.EPSILON) * 1000) / 1000}) ${x.ner_match ? 'NER' : ''}`,
              str_val: x.probability,
              doc_path: '',
              spans: [0, 0],
              tagger_id: x[val.taggerIdAccessor],
              source: x.tag
            });
          } else {
            predicted.push({
              fact: `${x.result} (${Math.round((x.probability + Number.EPSILON) * 1000) / 1000})`,
              str_val: x.probability,
              doc_path: '',
              spans: [0, 0],
              tagger_id: x[val.taggerIdAccessor],
              source: x.result
            });
          }
        });
        this.uniqueFacts = this.getUniqueFacts(predicted);
      }
      // make selected fields open the accordion panels by default
      if (this.selectedFields !== val.fields) {
        this.selectedFields = val.fields;
        val.fields.forEach(field => {
          const fieldSelected = this.resultFields.find(y => y === field);
          if (fieldSelected && !this.selection.isSelected(fieldSelected)) {
            this.selection.toggle(fieldSelected);
          }
        });
      }
    }

  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef) {
  }

  getUniqueFacts(matches: Match[]): { fact: Match; textColor: string; backgroundColor: string }[] {
    const returnVal: { fact: Match, textColor: string, backgroundColor: string }[] = [];
    // @ts-ignore
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

  // tslint:disable-next-line:no-any
  getDistinctMatches(data: { matches: any[], document: any }): Match[] {
    if (data.matches) {
      data.matches.forEach(fact => {
        if (typeof fact.spans === 'string') {
          (fact.spans) = JSON.parse(fact.spans as string).flat();
        }
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
            if (previousMatch.source && match.source) {
              const src = JSON.parse(previousMatch.source);
              const matchSrc = JSON.parse(match.source);

              if (src.hasOwnProperty(this.taggerIdAccessor) && matchSrc.hasOwnProperty(this.taggerIdAccessor)) {
                src[this.taggerIdAccessor] = src[this.taggerIdAccessor] + ', ' + matchSrc[this.taggerIdAccessor];
                previousMatch.source = JSON.stringify(src);
              }
            }
          }
        }
      }
      return UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.str_val));
    }
    return [];
  }

  private sortByStartLowestSpan(a: Match, b: Match): -1 | 1 {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }


  ngOnInit(): void {
  }

}

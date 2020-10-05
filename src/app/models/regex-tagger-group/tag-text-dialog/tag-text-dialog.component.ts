import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Match, RegexTaggerGroup, RegexTaggerGroupTagTextResult} from '../../../shared/types/tasks/RegexTaggerGroup';
import {filter, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {HttpErrorResponse} from '@angular/common/http';
import {HighlightSettings} from '../../../shared/SettingVars';


@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit {
  result: RegexTaggerGroupTagTextResult;
  distinctMatches: Match[];
  isLoading = false;
  model: { text: string } = {text: ''};
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  defaultColors = HighlightSettings.legibleColors;

  constructor(private regexTaggerGroupService: RegexTaggerGroupService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTaggerGroup; }) {
  }

  ngOnInit(): void {
  }

  taggerIdAccessor = (x: Match) => 'regex tagger id: ' + JSON.parse(x.source)?.regextagger_id;

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        text: this.model.text
      };
      this.regexTaggerGroupService.tagText(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          this.result.matches.forEach(match => {
            match.fact = match.str_val;
          });
          this.distinctMatches = this.getDistinctMatches(this.result);
          this.uniqueFacts = this.getUniqueFacts(this.result.matches);
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
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

  getDistinctMatches(data: RegexTaggerGroupTagTextResult): Match[] {
    const text = data.text;
    data.matches.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });
    // remove document wide facts and empty facts (facts that have same span start and end index)
    const matches = data.matches.filter(x => x.spans[0] !== x.spans[1]);
    matches.sort(this.sortByStartLowestSpan);
    let previousMatch: Match | undefined;
    for (const match of matches) {
      const matchSpans: number[] = match.spans as number[];
      match.str_val = text.substr(matchSpans[0], matchSpans[1] - matchSpans[0]);
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
    return UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.str_val));
  }

  private sortByStartLowestSpan(a: Match, b: Match): -1 | 1 {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }
}

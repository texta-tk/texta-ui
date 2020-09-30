import {Component, Inject, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {
  Match,
  RegexTaggerTagTextResult
} from '../../../shared/types/tasks/RegexTaggerGroup';
import {HighlightSettings} from '../../../shared/SettingVars';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit {
  result: RegexTaggerTagTextResult;
  distinctMatches: Match[];
  isLoading = false;
  model: { text: string } = {text: ''};
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  defaultColors = HighlightSettings.legibleColors;

  constructor(private regexTaggerService: RegexTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTagger; }) {
  }

  taggerIdAccessor = (x: Match) => '';
  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        text: this.model.text
      };
      this.regexTaggerService.tagText(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          this.distinctMatches = UtilityFunctions.getDistinctByProperty(this.result.matches, (y => y.str_val));
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

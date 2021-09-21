import {Component, Inject, OnInit} from '@angular/core';
import {Match} from '../../../shared/types/tasks/RegexTaggerGroup';
import {HighlightSettings} from '../../../shared/SettingVars';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {RakunExtractor} from '../../../shared/types/tasks/RakunExtractor';
import {RakunExtractorService} from '../../../core/models/rakun-extractor/rakun-extractor.service';
import {filter, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';

@Component({
  selector: 'app-extract-from-text-dialog',
  templateUrl: './extract-from-text-dialog.component.html',
  styleUrls: ['./extract-from-text-dialog.component.scss']
})
export class ExtractFromTextDialogComponent implements OnInit {
  // tslint:disable-next-line:no-any
  result: any;
  distinctMatches: Match[];
  isLoading = false;
  model: { text: string } = {text: ''};
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  defaultColors = HighlightSettings.legibleColors;
  // tslint:disable-next-line:no-any
  public rakunOptions: any;

  constructor(private rakunExtractorService: RakunExtractorService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, rakun: RakunExtractor; }) {
  }

  taggerIdAccessor = (x: Match) => '';

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj && this.data?.rakun?.id) {
        return this.rakunExtractorService.getRakunExtractorTagTextOptions(proj.id, this.data.rakun.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.rakunOptions = options;
      }
    });
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.rakun) {
      this.isLoading = true;
      const body = {
        text: this.model.text,
        add_spans: true,
      };
      this.rakunExtractorService.extractFromText(this.data.currentProjectId, this.data.rakun.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          this.distinctMatches = UtilityFunctions.getDistinctByProperty(this.result.keywords, (y => y.str_val));
          this.uniqueFacts = this.getUniqueFacts(this.result.keywords);
        } else if (x instanceof HttpErrorResponse) {
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

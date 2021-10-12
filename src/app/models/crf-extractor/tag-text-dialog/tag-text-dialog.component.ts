import {Component, Inject, OnInit} from '@angular/core';
import {Match} from '../../../shared/types/tasks/RegexTaggerGroup';
import {HighlightSettings} from '../../../shared/SettingVars';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {filter, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {CRFExtractor} from '../../../shared/types/tasks/CRFExtractor';
import {CRFExtractorService} from '../../../core/models/crf-extractor/crf-extractor.service';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit {
  // tslint:disable-next-line:no-any
  result: any;
  distinctMatches: Match[];
  isLoading = false;
  model: { text: string } = {text: ''};
  uniqueFacts: { fact: Match, textColor: string, backgroundColor: string }[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  defaultColors = HighlightSettings.legibleColors;
  // tslint:disable-next-line:no-any
  public crfOptions: any;

  constructor(private crfExtractorService: CRFExtractorService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, crfExtractor: CRFExtractor; }) {
  }

  taggerIdAccessor = (x: Match) => '';

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj && this.data?.crfExtractor?.id) {
        return this.crfExtractorService.getCRFExtractorTagTextOptions(proj.id, this.data.crfExtractor.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.crfOptions = options;
      }
    });
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.crfExtractor) {
      this.isLoading = true;
      const body = {
        text: this.model.text,
        add_spans: true,
      };
      this.crfExtractorService.tagText(this.data.currentProjectId, this.data.crfExtractor.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.colorMap = new Map();
          this.result = x;
          this.result.texta_facts.map((y: { doc_path: string; }) => y.doc_path = 'text');
          // @ts-ignore
          this.distinctMatches = UtilityFunctions.getDistinctByProperty(x.texta_facts, (y => y.str_val));
          // @ts-ignore
          this.uniqueFacts = this.getUniqueFacts(x.texta_facts);
        } else if (x instanceof HttpErrorResponse) {
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
}

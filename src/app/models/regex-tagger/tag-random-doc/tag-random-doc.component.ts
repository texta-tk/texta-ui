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
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  selection = new SelectionModel<number | string>(true, [0, 1]);
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;

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
      this.regexTaggerService.tagRandomDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    }
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

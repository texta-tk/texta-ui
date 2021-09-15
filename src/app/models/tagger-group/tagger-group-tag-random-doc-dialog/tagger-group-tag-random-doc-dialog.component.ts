import {Component, Inject, OnInit} from '@angular/core';
import {TaggerGroupService} from 'src/app/core/models/taggers/tagger-group.service';
import {Tagger, TaggerGroup} from 'src/app/shared/types/tasks/Tagger';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LogService} from 'src/app/core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {filter, take} from 'rxjs/operators';
import {ProjectStore} from '../../../core/projects/project.store';
import {ProjectIndex} from '../../../shared/types/Project';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {Match} from '../../../shared/types/tasks/RegexTaggerGroup';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';


@Component({
  selector: 'app-tagger-group-tag-random-doc-dialog',
  templateUrl: './tagger-group-tag-random-doc-dialog.component.html',
  styleUrls: ['./tagger-group-tag-random-doc-dialog.component.scss']
})
export class TaggerGroupTagRandomDocDialogComponent implements OnInit {
  // tslint:disable-next-line:no-any
  result: { document: unknown, prediction: { result: boolean, probability: number, tag: string; }, predictionTags: any[], tags: any[] };
  fields: string[] = [];
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  selection = new SelectionModel<number | string>(true, [0, 1]);
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private taggerGroupService: TaggerGroupService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: TaggerGroup; }) {
  }

  taggerIdAccessor = (x: Match) => `probability: ${x.str_val}`;

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x && this.model.indices.length === 0) {
        this.model.indices = x;
        if (this.model.fields.length === 0) {
          this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
        }
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
      this.taggerGroupService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
          this.result.predictionTags = this.result.tags;
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }
}

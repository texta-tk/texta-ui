import {Component, Inject, OnInit} from '@angular/core';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {filter, switchMap, take} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {of, Subject} from 'rxjs';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {SelectionModel} from '@angular/cdk/collections';
import {Match} from '../../../shared/types/tasks/RegexTaggerGroup';

@Component({
  selector: 'app-tag-random-doc-dialog',
  templateUrl: './tag-random-doc-dialog.component.html',
  styleUrls: ['./tag-random-doc-dialog.component.scss']
})
export class TagRandomDocDialogComponent  implements OnInit {
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

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: BertTagger; }) {
  }

  taggerIdAccessor = (x: Match) => 'probability: ' + x.str_val;

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
        if (this.data.tagger.indices && this.data.tagger.fields) {
          const indices = this.projectIndices.filter(c => this.data.tagger.indices.some(y => y.name === c.index));
          if (indices.length > 0) {
            this.model.indices = indices;
            this.indicesOpenedChange(false); // refreshes the field and fact selection data
            this.model.fields = this.data.tagger.fields;
          }
        }
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
      this.bertTaggerService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
          this.result.predictionTags = [this.result.prediction];
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }
}

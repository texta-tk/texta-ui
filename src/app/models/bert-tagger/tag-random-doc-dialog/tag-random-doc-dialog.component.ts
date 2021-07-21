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
import {of} from 'rxjs';

@Component({
  selector: 'app-tag-random-doc-dialog',
  templateUrl: './tag-random-doc-dialog.component.html',
  styleUrls: ['./tag-random-doc-dialog.component.scss']
})
export class TagRandomDocDialogComponent implements OnInit {
  result: { document: unknown, prediction: { result: boolean, probability: number } };
  isLoading = false;
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  // tslint:disable-next-line:no-any
  bertOptions: any;

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: BertTagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger) {
      this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
        if (x) {
          this.projectIndices = x;
          this.model.indices = x.filter(index => this.data.tagger.indices.map(y => y.name).includes(index.index));
          this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
          this.projectFields.forEach(y => {
            const field = y.fields.find(h => this.data.tagger.fields.includes(h.path));
            if (field) {
              this.model.fields.push(field.path);
            }
          });
        }
      });
    }
    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj) {
        return this.bertTaggerService.tagRDocOptions(proj.id, this.data.tagger.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.bertOptions = options;
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
      this.bertTaggerService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id,
        {
          indices: this.model.indices.map(x => [{name: x.index}]).flat(),
          fields: this.model.fields
        })
        // tslint:disable-next-line:no-any
        .subscribe((resp: any | HttpErrorResponse) => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.result = resp;
          } else if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 4000);
          }
          this.isLoading = false;
        });
    }
  }
}

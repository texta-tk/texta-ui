import {Component, Inject, OnInit} from '@angular/core';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {filter, take} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {BertTaggerService} from '../../../core/models/bert-tagger/bert-tagger.service';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

@Component({
  selector: 'app-tag-random-doc-dialog',
  templateUrl: './tag-random-doc-dialog.component.html',
  styleUrls: ['./tag-random-doc-dialog.component.scss']
})
export class TagRandomDocDialogComponent implements OnInit {
  result: { document: unknown, prediction: { result: boolean, probability: number } };
  isLoading = false;
  projectIndices: ProjectIndex[];
  fieldsUnique: Field[] = [];
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: BertTagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger) {
      this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
        if (x) {
          this.projectIndices = x;
          this.model.indices = x.filter(index => this.data.tagger.indices.map(y => y.name).includes(index.index));
          this.getFieldsForIndices(this.model.indices);
          this.model.indices.forEach(y => {
            const field = this.fieldsUnique.find(c => this.data.tagger.fields.includes(c.path));
            if (field) {
              this.model.fields.push(field.path);
            }
          });
        }
      });
    }
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

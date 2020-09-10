import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {forkJoin, of, Subject} from 'rxjs';
import {NgModel} from '@angular/forms';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {RegexTaggerGroup} from '../../../shared/types/tasks/RegexTaggerGroup';
import {debounceTime, filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ProjectStore} from '../../../core/projects/project.store';

@Component({
  selector: 'app-tag-random-doc',
  templateUrl: './tag-random-doc.component.html',
  styleUrls: ['./tag-random-doc.component.scss']
})
export class TagRandomDocComponent implements OnInit {
  fields: string[] = [];
  result: { matches: unknown, texts: string[] };
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model: { indices: ProjectIndex[], fields: Field[] } = {indices: [], fields: []};
  projectIndices: ProjectIndex[];
  fieldsUnique: Field[] = [];

  constructor(private regexTaggerGroupService: RegexTaggerGroupService, private logService: LogService,
              private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTaggerGroup; }) {
  }

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });

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
      const body = {
        indices: this.model.indices.map(x => [{name: x.index}]).flat(),
        fields: this.model.fields
      };
      this.regexTaggerGroupService.tagRandomDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }
}

import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {LogService} from '../../../core/util/log.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {ElasticsearchQuery} from '../../searcher-sidebar/build-search/Constraints';
import {FormControl} from '@angular/forms';
import {ProjectService} from '../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-export-search-dialog',
  templateUrl: './export-search-dialog.component.html',
  styleUrls: ['./export-search-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportSearchDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  elasticSearchQuery: ElasticsearchQuery;
  public columnFormControl = new FormControl([]);
  public projectFields: ProjectIndex[];

  constructor(private dialogRef: MatDialogRef<ExportSearchDialogComponent>,
              private searcherService: SearcherService,
              private logService: LogService,
              private projectService: ProjectService,
              private searcherComponentService: SearcherComponentService,
              @Inject(MAT_DIALOG_DATA) public data: {
                currentProjectId: number, projectFields: ProjectIndex[],
                selectedProjectFields: string[]
              }) {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    if (this.data.currentProjectId && this.data.projectFields && this.data.selectedProjectFields) {
      this.projectFields = this.data.projectFields;
      this.columnFormControl.setValue(this.data.selectedProjectFields);
      this.searcherComponentService.getElasticQuery().pipe(takeUntil(this.destroyed$)).subscribe(qry => {
        if (qry) {
          this.elasticSearchQuery = qry;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.data.currentProjectId) {
      const body = {
        fields: this.columnFormControl.value,
        indices: this.projectFields.map(y => y.index),
        query: this.elasticSearchQuery.elasticSearchQuery
      };
      this.projectService.exportSearch(this.data.currentProjectId, body).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          const a = document.createElement('a');
          a.href = resp;
          a.download = resp;
          a.click();
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp);
        }
        this.dialogRef.close();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

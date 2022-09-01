import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {LogService} from '../../../core/util/log.service';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {ElasticsearchQuery} from '../../searcher-sidebar/build-search/Constraints';
import {UntypedFormControl} from '@angular/forms';
import {ProjectService} from '../../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../../../core/util/local-storage.service';

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
  public columnFormControl = new UntypedFormControl([]);
  public projectFields: ProjectIndex[];
  public isDownloading = false;

  constructor(private dialogRef: MatDialogRef<ExportSearchDialogComponent>,
              private searcherService: SearcherService,
              private logService: LogService,
              private projectService: ProjectService,
              private localeStorageService: LocalStorageService,
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
      this.isDownloading = true;
      const body = {
        fields: this.columnFormControl.value,
        indices: this.projectFields.map(y => y.index),
        query: this.elasticSearchQuery.elasticSearchQuery
      };
      this.projectService.exportSearch(this.data.currentProjectId, body).pipe(takeUntil(this.destroyed$), switchMap(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          return this.projectService.downloadExportedSearch(x);
        }
        return of(null);
      })).subscribe(resp => {
        this.isDownloading = false;
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.downloadBlob(resp);
          this.dialogRef.close();
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  downloadBlob(blob: Blob | MediaSource): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = `${this.data.projectFields.map(x => x.index).join('_')}_search.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

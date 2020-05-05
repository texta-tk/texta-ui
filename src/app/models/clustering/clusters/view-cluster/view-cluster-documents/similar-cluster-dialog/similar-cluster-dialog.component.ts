import {AfterViewInit, ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {LogService} from '../../../../../../core/util/log.service';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {ClusterService} from '../../../../../../core/models/clusters/cluster.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatTableDataSource} from '@angular/material/table';
import {ClusterDocument, ClusterMoreLikeThis} from '../../../../../../shared/types/tasks/Cluster';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {SelectionModel} from '@angular/cdk/collections';
import {SimilarOptionsDialogComponent} from './similar-options-dialog/similar-options-dialog.component';
import {Observable, of, Subject} from 'rxjs';
import {switchMap, takeUntil} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../../../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {LocalStorageService} from '../../../../../../core/util/local-storage.service';
import {SignificantWordsWorker} from '../SignificantWordsWorker';

@Component({
  selector: 'app-similar-cluster-dialog',
  templateUrl: './similar-cluster-dialog.component.html',
  styleUrls: ['./similar-cluster-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimilarClusterDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  public tableData: MatTableDataSource<any> = new MatTableDataSource();
  public displayedColumns: string[] = [];
  public filterColumns: string[] = [];
  public infiniteColumns: string[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults = true;
  selectedRows = new SelectionModel<ClusterDocument>(true, []);
  moreLikeQuery$: Subject<Observable<ClusterMoreLikeThis[] | HttpErrorResponse>> = new Subject<Observable<ClusterMoreLikeThis[] | HttpErrorResponse>>();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  queryOptions: any;
  charLimit = 300;

  constructor(private clusterService: ClusterService, private logService: LogService, private localStorageService: LocalStorageService,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: {
                clusterId: number,
                clusteringId: number,
                projectId: number;
                significantWords: { key: string, count: number }[]
              }) {
  }

  ngOnInit(): void {
    this.moreLikeQuery$.pipe(takeUntil(this.destroyed$), switchMap(x => {
      if (x) {
        this.isLoadingResults = true;
        return x;
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.infiniteColumns = Object.getOwnPropertyNames(resp[0]._source);
        if (this.displayedColumns.length === 0) {
          this.displayedColumns = ['select', ...this.infiniteColumns];
          this.filterColumns = [...this.displayedColumns];
          const state = this.localStorageService.getProjectState(this.data.projectId);
          const clusteringState = state?.models?.clustering[`${this.data.clusteringId.toString()}`];
          if (clusteringState) {
            if (clusteringState.charLimit) {
              this.charLimit = clusteringState.charLimit;
            }
            if (clusteringState.selectedFields) {
              const selected = clusteringState.selectedFields.filter(x => this.displayedColumns.includes(x));
              if (selected.length > 0) {
                this.displayedColumns = selected;
              }
            }
          }
        }
        if (typeof Worker !== 'undefined') {
          SignificantWordsWorker.worker.onmessage = ({data}) => {
            this.isLoadingResults = false;
            this.tableData.data = data.docs;
          };
          SignificantWordsWorker.worker.postMessage({words: this.data.significantWords, docs: resp, accessor: '_source'});
        } else {
          this.isLoadingResults = false;
          this.tableData.data = resp;
        }
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    if (this.data.clusteringId && this.data.clusterId && this.data.projectId) {
      this.moreLikeQuery$.next(this.clusterService.moreLikeCluster(this.data.projectId, this.data.clusteringId, this.data.clusterId,
        {size: 25, include_meta: true}));
    }

  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectedRows.clear() :
      this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  addAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Add',
          mainText: `Add ${this.selectedRows.selected.length} Documents to the cluster?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const idsToAdd = this.selectedRows.selected.map((doc: any) => doc._id);
          const body = {ids: idsToAdd};
          this.clusterService.addDocumentsToCluster(this.data.projectId, this.data.clusteringId, this.data.clusterId, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Documents added`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedDoc: any) => {
      const index: number = this.tableData.data.findIndex(row => row._id === selectedDoc._id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  similarOptions() {
    const dialogRef = this.dialog.open(SimilarOptionsDialogComponent, {
      data: {options: this.queryOptions},
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(x => {
      if (x) {
        this.queryOptions = x;
        this.moreLikeQuery$.next(
          this.clusterService.moreLikeCluster(this.data.projectId, this.data.clusteringId, this.data.clusterId, x));
      }
    });
  }

  trackById(index, val) {
    return val.id;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

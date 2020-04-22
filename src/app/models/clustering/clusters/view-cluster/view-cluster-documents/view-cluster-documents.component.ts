import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ClusterDetails, ClusterDocument} from '../../../../../shared/types/tasks/Cluster';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ProjectStore} from '../../../../../core/projects/project.store';
import {ClusterService} from '../../../../../core/models/clusters/cluster.service';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {Observable, of, Subject} from 'rxjs';
import {LogService} from '../../../../../core/util/log.service';
import {ConfirmDialogComponent} from '../../../../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {Project} from '../../../../../shared/types/Project';
import {SimilarClusterDialogComponent} from './similar-cluster-dialog/similar-cluster-dialog.component';
import {TagClusterDialogComponent} from './tag-cluster-dialog/tag-cluster-dialog.component';

@Component({
  selector: 'app-view-cluster-documents',
  templateUrl: './view-cluster-documents.component.html',
  styleUrls: ['./view-cluster-documents.component.scss']
})
export class ViewClusterDocumentsComponent implements OnInit, AfterViewInit, OnDestroy {
  public tableData: MatTableDataSource<ClusterDocument> = new MatTableDataSource();
  public displayedColumns: string[] = [];
  public filterColumns: string[] = [];
  public infiniteColumns: string[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  isLoadingResults = true;
  currentProject: Project;
  clusteringId: number;
  clusterId: number;
  selectedRows = new SelectionModel<ClusterDocument>(true, []);
  clusterDocumentsQueue$: Subject<Observable<ClusterDetails | HttpErrorResponse>> = new Subject();
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private projectStore: ProjectStore,
    private logService: LogService,
    private clusterService: ClusterService) {
  }

  ngOnInit(): void {
    this.clusterDocumentsQueue$.pipe(takeUntil(this.destroyed$), switchMap(x => {
      if (x) {
        this.isLoadingResults = true;
        return x;
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.infiniteColumns = Object.getOwnPropertyNames(resp.documents[0].content);
        if (this.displayedColumns.length === 0) {
          this.filterColumns = ['select', ...this.infiniteColumns];
          this.displayedColumns = [...this.filterColumns];
        }
        this.tableData.data = resp.documents;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    const clusteringId = this.route.snapshot.paramMap.get('clusteringId');
    const clusterId = this.route.snapshot.paramMap.get('clusterId');
    if (clusterId && clusteringId) {
      this.clusterId = +clusterId;
      this.clusteringId = +clusteringId;
      this.projectStore.getCurrentProject().pipe(filter(b => !!b), take(1)).subscribe(proj => {
        if (proj) {
          this.currentProject = proj;
          this.clusterDocumentsQueue$.next(this.clusterService.clusterDetails(proj.id, this.clusteringId, this.clusterId));
        }
      });
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


  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Documents?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((cluster: ClusterDocument) => cluster.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.clusterService.bulkDeleteClusterDocuments(this.currentProject.id, this.clusteringId, this.clusterId, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Documents deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  moreLikeThis() {
    const dialogRef = this.dialog.open(SimilarClusterDialogComponent, {
      data: {
        clusterId: this.clusterId,
        clusteringId: this.clusteringId,
        projectId: this.currentProject.id,
      },
      height: '90vh',
      width: '80vw',
      autoFocus: false,
      panelClass: 'dialog-container-no-padding'
    });
    dialogRef.afterClosed().subscribe(x => {
      this.clusterDocumentsQueue$.next(this.clusterService.clusterDetails(this.currentProject.id, this.clusteringId, this.clusterId));
    });
  }

  tag() {
    const dialogRef = this.dialog.open(TagClusterDialogComponent, {
      data: {
        clusterId: this.clusterId,
        clusteringId: this.clusteringId,
        projectId: this.currentProject.id,
      },
      width: '600px'
    });
    dialogRef.afterClosed().subscribe(x => {
      console.log(x);
    });
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedCluster: ClusterDocument) => {
      const index: number = this.tableData.data.findIndex(cluster => cluster.id === selectedCluster.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  trackById(index, val) {
    return val.id;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


}

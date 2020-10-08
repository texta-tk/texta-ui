import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {merge, of, Subject, Subscription} from 'rxjs';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {Cluster} from '../../shared/types/tasks/Cluster';
import {ClusterService} from '../../core/tools/clusters/cluster.service';
import {QueryDialogComponent} from '../../shared/components/dialogs/query-dialog/query-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {CreateClusteringDialogComponent} from './create-clustering-dialog/create-clustering-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';
import {EditStopwordsDialogComponent} from './edit-stopwords-dialog/edit-stopwords-dialog.component';
import {Index} from '../../shared/types/Index';

@Component({
  selector: 'app-clustering',
  templateUrl: './topic-analyzer.component.html',
  styleUrls: ['./topic-analyzer.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class TopicAnalyzerComponent implements OnInit, OnDestroy, AfterViewInit {

  expandedElement: Cluster | null;
  public tableData: MatTableDataSource<Cluster> = new MatTableDataSource();
  selectedRows = new SelectionModel<Cluster>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'fields', 'query', 'num_cluster', 'use_lsi', 'task__time_started',
    'task__time_completed', 'task__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  resultsLength: number;

  constructor(private projectStore: ProjectStore,
              private clusterService: ClusterService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  public getIndexName = (x: Index) => x.name;

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.clusterService.getClusters(
              this.currentProject.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
          } else {
            return of(null);
          }
        })).subscribe((data) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data && !(data instanceof HttpErrorResponse)) {
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      }
    });
  }


  editStopwordsDialog(element: Cluster): void {
    const dialogRef = this.dialog.open(EditStopwordsDialogComponent, {
      data: {cluster: element, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateClusteringDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: Cluster | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
        this.logService.snackBarMessage(`Created cluster ${resp.description}`, 2000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  retrainCluster(element: Cluster): null | Subscription {
    if (this.currentProject) {
      return this.clusterService.retrainCluster(this.currentProject.id, element.id)
        .subscribe((resp: unknown | HttpErrorResponse) => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Successfully started retraining clustering', 4000);
          } else if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 5000);
          }
        });
    } else {
      return null;
    }
  }

  openQueryDialog(query: string): void {
    this.dialog.open(QueryDialogComponent, {
      data: {query},
      maxHeight: '965px',
      width: '700px',
    });
  }

  onDelete(cluster: Cluster, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this clustering?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.clusterService.deleteCluster(this.currentProject.id, cluster.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted cluster ${cluster.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selectedRows.clear() :
      this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} clusterings?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((cluster: Cluster) => cluster.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.clusterService.bulkDeleteClusterings(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} clusterings.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedCluster: Cluster) => {
      const index: number = this.tableData.data.findIndex(cluster => cluster.id === selectedCluster.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

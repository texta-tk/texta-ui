import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TopicAnalyzerService} from '../../../core/tools/topic-analyzer/topic-analyzer.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ClusterView} from '../../../shared/types/tasks/Cluster';
import {ProjectStore} from '../../../core/projects/project.store';
import {debounceTime, distinctUntilChanged, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../../shared/types/Project';
import {ArrowViewStateTransition, MatSort, MatSortHeader} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {SelectionModel} from '@angular/cdk/collections';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {LogService} from '../../../core/util/log.service';
import {LocalStorageService} from '../../../core/util/local-storage.service';

interface Cluster {
  id: number;
  url: string;
  document_count: number;
  average_similarity: number;
  significant_words: { key: string, count: number }[];
  documents: string[];
}

@Component({
  selector: 'app-view-cluster',
  templateUrl: './view-cluster.component.html',
  styleUrls: ['./view-cluster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewClusterComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: ClusterView | null;
  public tableData: MatTableDataSource<Cluster> = new MatTableDataSource();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  selectedRows = new SelectionModel<Cluster>(true, []);
  public displayedColumns = ['select', 'id', 'significant_words', 'document_count', 'average_similarity'];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterTerm$ = new Subject<string>();

  currentProject: Project;
  clusteringId: number;
  public isLoadingResults = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logService: LogService,
    public dialog: MatDialog,
    private localStorageService: LocalStorageService,
    private projectStore: ProjectStore,
    private clusterService: TopicAnalyzerService) {
  }

  public sigWordAccessor = (x: { key: string, count: number }) => x.key;

  ngOnInit(): void {
    const clusterId = this.route.snapshot.paramMap.get('clusteringId');
    if (clusterId) {
      this.clusteringId = +clusterId;
      this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
        if (proj) {
          this.currentProject = proj;
          return this.clusterService.viewClusters(proj.id, +clusterId);
        }
        return of(null);
      })).subscribe(x => {
        this.isLoadingResults = false;
        if (x && !(x instanceof HttpErrorResponse)) {
          this.tableData.data = x.clusters;
          const state = this.localStorageService.getProjectState(this.currentProject);
          const clusteringState = `${this.clusteringId.toString()}`;
          if (state?.models?.clustering?.[clusteringState]?.sortDirection && this.tableData.sort) {
            this.tableData.sort.sort(state.models.clustering[clusteringState].sortDirection);
            const arrowViewStateTransition = {toState: 'active'} as ArrowViewStateTransition;
            // ugly hack
            const sortable = this.tableData.sort.sortables.get(state.models.clustering[clusteringState].sortDirection.id);
            (sortable as MatSortHeader)._setAnimationTransitionState(arrowViewStateTransition);
          }

        } else if (x instanceof HttpErrorResponse) {
          this.router.navigate(['../'], {relativeTo: this.route.parent});
        }
      });
    } else {
      this.router.navigate(['../'], {relativeTo: this.route.parent});
    }
    this.filterTerm$.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(x => {
      this.tableData.filter = x.trim().toLowerCase();
      if (this.tableData.paginator) {
        this.tableData.paginator.firstPage();
      }
    });

  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe(val => {
      const state = this.localStorageService.getProjectState(this.currentProject);
      if (val && val.active && state) {
        const clusteringState = `${this.clusteringId.toString()}`;
        if (state?.models?.clustering?.[clusteringState]) {
          state.models.clustering[clusteringState].sortDirection = {
            id: val.active,
            start: val.direction,
            disableClear: false
          };
        } else {
          if (state?.models?.clustering) {
            state.models.clustering[clusteringState] = {
              sortDirection: {
                id: val.active,
                start: val.direction,
                disableClear: false
              }
            };
          }
        }
        this.localStorageService.updateProjectState(this.currentProject, state);
      }
    });

    this.tableData.filterPredicate = this.customFilterPredicate();
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Clusters?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((cluster: Cluster) => cluster.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.clusterService.bulkDeleteClusters(this.currentProject.id, this.clusteringId, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} clusters`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: Cluster) => {
      const index: number = this.tableData.data.findIndex(cluster => cluster.id === selected.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  trackById(index: number, val: Cluster): number {
    return val.id;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterTerm$.next(filterValue);
  }

  customFilterPredicate(): (data: Cluster, filter: string) => boolean {
    return (data: Cluster, filter: string) => {
      return data.significant_words.some(x => {
        if (x.key) {
          const search = x.key.trim().toLowerCase().indexOf(filter.trim().toLowerCase()) !== -1;
          if (search) {
            return search;
          }
        }
      });
    };
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {LogService} from '../../core/util/log.service';
import {MatDialog, MatTableDataSource, MatSort, MatPaginator} from '@angular/material';
import {ProjectStore} from '../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {startWith, switchMap} from 'rxjs/operators';
import {Project} from '../../shared/types/Project';
import {Subscription} from 'rxjs';
import {CreateEmbeddingGroupDialogComponent} from './create-embedding-group-dialog/create-embedding-group-dialog.component';
import {EmbeddingsGroupService} from '../../core/embeddings/embeddings-group.service';
import {EmbeddingCluster} from '../../shared/types/tasks/Embedding';
import { SelectionModel } from '@angular/cdk/collections';
import { trigger, state, style, transition, animate } from '@angular/animations';
// import { BrowseClustersDialogComponent } from './browse-clusters-dialog/browse-clusters-dialog.component';

@Component({
  selector: 'app-embedding-group',
  templateUrl: './embedding-group.component.html',
  styleUrls: ['./embedding-group.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
  ])]
})
export class EmbeddingGroupComponent implements OnInit, OnDestroy, AfterViewInit {
  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;

  expandedElement: EmbeddingCluster | null;
  public tableData: MatTableDataSource<EmbeddingCluster> = new MatTableDataSource();
  selectedRows = new SelectionModel<EmbeddingCluster>(true, []);
  public displayedColumns = ['select', 'id', 'description', 'embedding', 'vocab_size', 'num_clusters',
  'time_started', 'time_completed', 'Task', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  currentProject: Project;
  resultsLength: number;


  constructor(public dialog: MatDialog,
              private projectStore: ProjectStore,
              private embeddingClusterService: EmbeddingsGroupService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().subscribe(
      (resp: HttpErrorResponse | Project) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.currentProject = resp;
          this.setUpPaginator();
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
          this.isLoadingResults = false;
        }
      });
  }

  setUpPaginator() {
    this.paginator.page.pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.embeddingClusterService.getEmbeddingGroups(
        this.currentProject.id,
        // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
      );
    })).subscribe((data: { count: number, results: EmbeddingCluster[] }) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      this.resultsLength = data.count;
      this.tableData.data = data.results;
    });
  }

  ngOnDestroy() {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
  }


  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEmbeddingGroupDialogComponent, {
      height: '860px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: EmbeddingCluster | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onBrowseClusters(cluster: EmbeddingCluster) {
    // const dialogRef = this.dialog.open(BrowseClustersDialogComponent, {
    //   data: {clusterId: cluster.id, currentProjectId: this.currentProject.id},
    //   height: '860px',
    //   width: '700px',
    // });
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

  onDelete(embCluster: EmbeddingCluster, index: number) {
    this.embeddingClusterService.deleteEmbeddingCluster(this.currentProject.id, embCluster.id).subscribe(() => {
      this.logService.snackBarMessage(`Embedding Cluster ${embCluster.id}: ${embCluster.description} deleted`, 2000);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
  }

  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      // Delete selected embeddings
      const idsToDelede = this.selectedRows.selected.map((embedding: EmbeddingCluster) => embedding.id);
      const body = { ids: idsToDelede };
      // Refresh embeddings
      this.embeddingClusterService.bulkDeleteEmbeddingClusters(this.currentProject.id, body).subscribe(() => {
        this.logService.snackBarMessage(`${this.selectedRows.selected.length} embeddings deleted`, 2000);
        this.removeSelectedRows();
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selected: EmbeddingCluster) => {
       const index: number = this.tableData.data.findIndex(embedding => embedding.id === selected.id);
       this.tableData.data.splice(index, 1);
       this.tableData.data = [...this.tableData.data];
     });
    this.selectedRows.clear();
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription, Subject, timer, merge } from 'rxjs';
import { MatTableDataSource, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { Project } from 'src/app/shared/types/Project';
import { ProjectStore } from 'src/app/core/projects/project.store';
import { LogService } from 'src/app/core/util/log.service';
import { switchMap, debounceTime, startWith } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { TagTextDialogComponent } from 'src/app/tagger/tagger/tag-text-dialog/tag-text-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import { QueryDialogComponent } from 'src/app/shared/components/dialogs/query-dialog/query-dialog.component';
import { TorchTagger } from 'src/app/shared/types/tasks/TorchTagger';
import { CreateTorchTaggerDialogComponent } from '../create-torch-tagger-dialog/create-torch-tagger-dialog.component';
import { TorchTaggerService } from '../torch-tagger.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-torch-tagger',
  templateUrl: './torch-tagger.component.html',
  styleUrls: ['./torch-tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class TorchTaggerComponent implements OnInit {


  private dialogAfterClosedSubscription: Subscription;
  private currentProjectSubscription: Subscription;
  private updateTorchTaggersSubscription: Subscription;

  expandedElement: TorchTagger | null;
  public tableData: MatTableDataSource<TorchTagger> = new MatTableDataSource();
  selectedRows = new SelectionModel<TorchTagger>(true, []);
  public displayedColumns = ['select', 'id', 'author__username', 'description', 'fields', 'task__time_started',
  'task__time_completed', 'f1_score', 'precision', 'recall', 'task__status', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';

  currentProject: Project;
  resultsLength: number;


  constructor(private projectStore: ProjectStore,
              private torchtaggerService: TorchTaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    // Check for updates after 30s every 30s
    this.updateTorchTaggersSubscription = timer(30000, 30000).pipe(switchMap(_ =>
        this.torchtaggerService.getTorchTaggers(this.currentProject.id,
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`)))
    .subscribe((resp: {count: number, results: TorchTagger[]} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.refreshTorchTaggers(resp.results);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit() {
    this.currentProjectSubscription = this.projectStore.getCurrentProject().subscribe(
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
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
    .pipe(debounceTime(250), startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      // DRF backend asks for '-' or '' to declare ordering direction

      const sortDirection = this.sort.direction === 'desc' ? '-' : ''
      return this.torchtaggerService.getTorchTaggers(
        this.currentProject.id,
        // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
        `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
    })).subscribe((data: {count: number, results: TorchTagger[]}) => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      this.resultsLength = data.count;
      this.tableData.data = data.results;
    });
  }


  refreshTorchTaggers(resp: TorchTagger[] | HttpErrorResponse) {
    if (resp && !(resp instanceof HttpErrorResponse)) {
      if (resp.length > 0) {
        resp.map(torchtagger => {
          const indx = this.tableData.data.findIndex(x => x.id === torchtagger.id);
          this.tableData.data[indx].task = torchtagger.task;
        });
      }
    }
  }


  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
    if (this.updateTorchTaggersSubscription) {
      this.updateTorchTaggersSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTorchTaggerDialogComponent, {
      maxHeight: '765px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: TorchTagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  tagTextDialog(torchtagger: TorchTagger) {
    const dialogRef = this.dialog.open(TagTextDialogComponent, {
      data: {torchtaggerId: torchtagger.id, currentProjectId: this.currentProject.id },
      maxHeight: '665px',
      width: '700px',
    });
  }


  onDelete(torchtagger: TorchTagger, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { confirmText: 'Delete', mainText: 'Are you sure you want to delete this TorchTagger?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.torchtaggerService.deleteTorchTagger(this.currentProject.id, torchtagger.id).subscribe(() => {
          this.logService.snackBarMessage(`TorchTagger ${torchtagger.id}: ${torchtagger.description} deleted`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
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
        data: { confirmText: 'Delete',  mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} TorchTaggers?` }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          // Delete selected torchtaggers
          const idsToDelede = this.selectedRows.selected.map((torchtagger: TorchTagger) => torchtagger.id);
          const body = { ids: idsToDelede };
          // Refresh torchtaggers
          this.torchtaggerService.bulkDeleteTorchTaggers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} TorchTaggers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTorchTagger: TorchTagger) => {
       const index: number = this.tableData.data.findIndex(torchtagger => torchtagger.id === selectedTorchTagger.id);
       this.tableData.data.splice(index, 1);
       this.tableData.data = [...this.tableData.data];
     });
    this.selectedRows.clear();
  }


  openQueryDialog(query: string) {
    const dialogRef = this.dialog.open(QueryDialogComponent, {
      data: { query },
      maxHeight: '665px',
      width: '700px',
    });
  }


  applyFilter(filterValue: string, field: string) {
    this.inputFilterQuery = `&${field}=${filterValue}`;
    this.filteredSubject.next();
  }


}

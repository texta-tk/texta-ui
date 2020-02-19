import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {startWith, switchMap, debounceTime} from 'rxjs/operators';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../../shared/types/Project';
import {Subscription, Subject, merge} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {TaggerGroup} from '../../../shared/types/tasks/Tagger';
import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupService} from '../../../core/models/taggers/tagger-group.service';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ModelsListDialogComponent} from './models-list-dialog/models-list-dialog.component';
import {TaggerGroupTagTextDialogComponent} from './tagger-group-tag-text-dialog/tagger-group-tag-text-dialog.component';
import {TaggerGroupTagDocDialogComponent} from './tagger-group-tag-doc-dialog/tagger-group-tag-doc-dialog.component';
import {ConfirmDialogComponent} from 'src/app/shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {TaggerGroupTagRandomDocDialogComponent} from './tagger-group-tag-random-doc-dialog/tagger-group-tag-random-doc-dialog.component';

@Component({
  selector: 'app-tagger-group',
  templateUrl: './tagger-group.component.html',
  styleUrls: ['./tagger-group.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class TaggerGroupComponent implements OnInit, OnDestroy, AfterViewInit {
  private projectSubscription: Subscription;
  private dialogAfterClosedSubscription: Subscription;

  expandedElement: TaggerGroup | null;
  public tableData: MatTableDataSource<TaggerGroup> = new MatTableDataSource();
  selectedRows = new SelectionModel<TaggerGroup>(true, []);
  public displayedColumns = ['select', 'author__username', 'description', 'fact_name', 'minimum_sample_size',
    'num_tags', 'f1_score', 'precision', 'recall', 'progress', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filteredSubject = new Subject();
  // For custom filtering, such as text search in description
  inputFilterQuery = '';
  filteringValues = {};

  currentProject: Project;
  resultsLength: number;


  constructor(public dialog: MatDialog,
              private projectStore: ProjectStore,
              private taggerGroupService: TaggerGroupService,
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
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
      .pipe(debounceTime(250), startWith({}), switchMap(() => {
        this.isLoadingResults = true;

        const sortDirection = this.sort.direction === 'desc' ? '-' : '';
        return this.taggerGroupService.getTaggerGroups(
          this.currentProject.id,
          // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
          `${this.inputFilterQuery}&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
        );
      })).subscribe((data: { count: number, results: TaggerGroup[] }) => {
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
    const dialogRef = this.dialog.open(CreateTaggerGroupDialogComponent, {
      maxHeight: '860px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: TaggerGroup | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  openModelsListDialog(taggerGroup: TaggerGroup) {
    const dialogRef = this.dialog.open(ModelsListDialogComponent, {
      data: {taggerGroupId: taggerGroup.id, currentProjectId: this.currentProject.id},
      maxHeight: '835px',
      width: '850px',
      panelClass: 'custom-no-padding-dialog'
    });
  }

  onModelsRetrain(taggerGroup: TaggerGroup) {
    this.taggerGroupService.modelsRetrain(taggerGroup.id, this.currentProject.id).subscribe(
      (resp: { 'success': 'retraining tasks created' } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage('Started retraining taggers', 3000);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        }
      }
    );
  }

  tagTextDialog(tagger: TaggerGroup) {
    const dialogRef = this.dialog.open(TaggerGroupTagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: TaggerGroup) {
    const dialogRef = this.dialog.open(TaggerGroupTagDocDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagRandomDocDialog(tagger: TaggerGroup) {
    const dialogRef = this.dialog.open(TaggerGroupTagRandomDocDialogComponent, {
      data: {tagger, currentProjectId: this.currentProject.id},
      minHeight: '300px',
      maxHeight: '710x',
      width: '1200px',
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

  onDelete(tagger: TaggerGroup, index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Tagger Group?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.taggerGroupService.deleteTaggerGroup(this.currentProject.id, tagger.id).subscribe(() => {
          this.logService.snackBarMessage(`Tagger Group ${tagger.id}: ${tagger.description} deleted`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }


  onDeleteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Tagger Groups?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelede = this.selectedRows.selected.map((tagger: TaggerGroup) => tagger.id);
          const body = {ids: idsToDelede};
          // Refresh taggers
          this.taggerGroupService.bulkDeleteTaggerGroups(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`${this.selectedRows.selected.length} Taggers deleted`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selectedTagger: TaggerGroup) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  applyFilter(filterValue: string, field: string) {
    this.filteringValues[field] = filterValue;
    this.paginator.pageIndex = 0;
    this.filterQueriesToString();
    this.filteredSubject.next();
  }

  filterQueriesToString() {
    this.inputFilterQuery = '';
    for (const field in this.filteringValues) {
      this.inputFilterQuery += `&${field}=${this.filteringValues[field]}`;
    }
  }
}

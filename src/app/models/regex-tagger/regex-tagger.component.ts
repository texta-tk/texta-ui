import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, of, Subject} from 'rxjs';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {debounceTime, publish, switchMap, takeUntil} from 'rxjs/operators';
import {RegexTagger} from '../../shared/types/tasks/RegexTagger';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {expandRowAnimation} from '../../shared/animations';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {SelectionModel} from '@angular/cdk/collections';
import {RegexTaggerService} from '../../core/models/taggers/regex-tagger.service';
import {CreateRegexTaggerDialogComponent} from './create-regex-tagger-dialog/create-regex-tagger-dialog.component';
import {MultiTagTextDialogComponent} from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-regex-tagger',
  templateUrl: './regex-tagger.component.html',
  styleUrls: ['./regex-tagger.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class RegexTaggerComponent implements OnInit, OnDestroy, AfterViewInit {
  public displayedColumns = ['select', 'id', 'description', 'operator', 'matchType', 'requiredWords', 'phraseSlop',
    'counterSlop', 'nAllowedEdits', 'ignoreCase', 'ignorePunctuation', 'fuzzy'];
  public isLoadingResults = true;
  public tableData: MatTableDataSource<RegexTagger> = new MatTableDataSource();

  destroyed$ = new Subject<boolean>();
  selectedRows = new SelectionModel<RegexTagger>(true, []);
  filteredSubject = new Subject();
  resultsLength: number;
  expandedElement: RegexTagger | null;
  currentProject: Project;
  patchRowQueue: Subject<RegexTagger> = new Subject();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private projectStore: ProjectStore,
              private regexTaggerService: RegexTaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;

    this.patchRowQueue.pipe(takeUntil(this.destroyed$), debounceTime(50)).subscribe(row => {
      if (this.currentProject) {
        this.regexTaggerService.patchRegexTagger(this.currentProject.id, row.id, row).subscribe();
      }
    });
  }


  ngAfterViewInit(): void {   // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.filteredSubject)
      .pipe(debounceTime(250), switchMap(() => {
        if (this.currentProject) {
          this.isLoadingResults = true;
          const sortDirection = this.sort.direction === 'desc' ? '-' : '';
          return this.regexTaggerService.getRegexTaggers(
            this.currentProject.id,
            // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
            `ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
        } else {
          return of(null);
        }
      })).subscribe(data => {
      // Flip flag to show that loading has finished.
      if (data instanceof HttpErrorResponse) {
        this.logService.snackBarError(data, 2000);
      } else if (data) {
        this.isLoadingResults = false;
        this.resultsLength = data.count;
        this.tableData.data = data.results;
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.filteredSubject.next(''); // refresh table
        }
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateRegexTaggerDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: RegexTagger) => {
      if (resp) {
        this.tableData.data = [resp, ...this.tableData.data];
        this.logService.snackBarMessage(`Created regex tagger: ${resp.description}`, 2000);
      }
    });
  }

  openMultiTagDialog(): void {
    this.dialog.open(MultiTagTextDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      data: JSON.parse(JSON.stringify(this.tableData.data)),
      disableClose: true
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
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} regex taggers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Delete selected taggers
          const idsToDelete = this.selectedRows.selected.map((tagger: RegexTagger) => tagger.id);
          const body = {ids: idsToDelete};
          // Refresh taggers
          this.regexTaggerService.bulkDeleteRegexTaggers(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} regex taggers.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selectedTagger: RegexTagger) => {
      const index: number = this.tableData.data.findIndex(tagger => tagger.id === selectedTagger.id);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data];
    });
    this.selectedRows.clear();
  }

  updateRegexTaggerRow(row: RegexTagger): void {
    this.patchRowQueue.next(row);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

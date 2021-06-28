import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, of, Subject} from 'rxjs';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
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
import {EditRegexTaggerDialogComponent} from './edit-regex-tagger-dialog/edit-regex-tagger-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagRandomDocComponent} from './tag-random-doc/tag-random-doc.component';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';

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
    'counterSlop', 'nAllowedEdits', 'fuzzy', 'ignoreCase', 'ignorePunctuation', 'task__status', 'actions'];
  public isLoadingResults = true;
  public tableData: MatTableDataSource<RegexTagger> = new MatTableDataSource();

  destroyed$ = new Subject<boolean>();
  selectedRows = new SelectionModel<RegexTagger>(true, []);
  expandedElements: boolean[] = [];
  currentProject: Project;
  patchRowQueue: Subject<RegexTagger> = new Subject();
  resultsLength: number;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  private updateTable = new Subject<boolean>();

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

    merge(this.sort.sortChange, this.paginator.page, this.updateTable)
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
      this.expandedElements = [];
      // Flip flag to show that loading has finished.
      if (data instanceof HttpErrorResponse) {
        this.logService.snackBarError(data, 2000);
      } else if (data) {
        this.isLoadingResults = false;
        this.tableData.data = data.results;
        this.resultsLength = data.count;
        this.expandedElements = new Array(data.results.length).fill(false);
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.currentProject = resp;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
          this.updateTable.next(true); // refresh table
        }
      }
    });
  }

  edit(element: RegexTagger): void {
    const dialogRef = this.dialog.open(EditRegexTaggerDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      disableClose: true,
      data: element,
    });
    dialogRef.afterClosed().subscribe((resp: RegexTagger) => {
      if (resp) {
        const index = this.tableData.data.findIndex(x => x.id === resp.id);
        if (index > -1) {
          this.tableData.data.splice(index, 1);
        }
        this.tableData.data = [resp, ...this.tableData.data];
      }
    });
  }

  duplicateRegexTagger(element: RegexTagger): void {
    this.regexTaggerService.duplicate(this.currentProject.id, element.id, element).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(x.message, 4000);
        this.updateTable.next(true);
      } else if (x) {
        this.logService.snackBarError(x);
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

  onTagText(element: RegexTagger): void {
    this.dialog.open(TagTextDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
      data: {currentProjectId: this.currentProject.id, tagger: element}
    });
  }

  onTagRandomDoc(element: RegexTagger): void {
    this.dialog.open(TagRandomDocComponent, {
      maxHeight: '90vh',
      width: '700px',
      disableClose: true,
      data: {currentProjectId: this.currentProject.id, tagger: element}
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

  onDelete(regexTagger: RegexTagger, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this regex tagger?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const body = {ids: [regexTagger.id]};
        this.regexTaggerService.bulkDeleteRegexTaggers(this.currentProject.id, body).subscribe(() => {
          this.logService.snackBarMessage(`Deleted regex tagger ${regexTagger.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
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

  applyToIndexDialog(tagger: RegexTagger): void {
    this.dialog.open(ApplyToIndexDialogComponent, {
      data: tagger,
      maxHeight: '90vh',
      width: '700px',
    }).afterClosed().subscribe(x => {
      this.updateTable.next(true);
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

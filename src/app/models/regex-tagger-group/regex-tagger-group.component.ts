import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {merge, of, Subject} from 'rxjs';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateRegexTaggerGroupDialogComponent} from './create-regex-tagger-group-dialog/create-regex-tagger-group-dialog.component';
import {expandRowAnimation} from '../../shared/animations';
import {RegexTaggerGroup} from '../../shared/types/tasks/RegexTaggerGroup';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {RegexTaggerGroupService} from '../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../core/util/log.service';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {MultiTagTextDialogComponent} from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import {ApplyTaggerGroupDialogComponent} from './apply-tagger-group-dialog/apply-tagger-group-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagDocDialogComponent} from './tag-doc-dialog/tag-doc-dialog.component';
import {TagRandomDocComponent} from './tag-random-doc/tag-random-doc.component';

@Component({
  selector: 'app-regex-tagger-group',
  templateUrl: './regex-tagger-group.component.html',
  styleUrls: ['./regex-tagger-group.component.scss'],
  animations: [
    expandRowAnimation
  ]
})
export class RegexTaggerGroupComponent implements OnInit, OnDestroy, AfterViewInit {
  expandedElement: RegexTaggerGroup | null;
  public tableData: MatTableDataSource<RegexTaggerGroup> = new MatTableDataSource();
  selectedRows = new SelectionModel<RegexTaggerGroup>(true, []);
  public displayedColumns = ['select', 'id', 'author_username', 'description', 'regex_taggers', 'actions'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;

  constructor(private projectStore: ProjectStore,
              private regexTaggerGroupService: RegexTaggerGroupService,
              public dialog: MatDialog,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x) {
        this.isLoadingResults = true;
        this.currentProject = x;
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
      } else {
        this.isLoadingResults = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
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
            return this.regexTaggerGroupService.getRegexTaggerGroupTasks(
              this.currentProject.id,
              // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
              `ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
          } else {
            return of(null);
          }
        })).subscribe(data => {
      // Flip flag to show that loading has finished.
      this.isLoadingResults = false;
      if (data && !(data instanceof HttpErrorResponse)) {
        this.tableData.data = data.results;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateRegexTaggerGroupDialogComponent, {
      maxHeight: '650px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [resp, ...this.tableData.data];
      }
    });
  }

  onTagText(element: RegexTaggerGroup): void {
    this.dialog.open(TagTextDialogComponent, {
      maxHeight: '750px',
      width: '700px',
      disableClose: true,
      data: {currentProjectId: this.currentProject.id, tagger: element}
    });
  }


  onTagDoc(element: RegexTaggerGroup): void {
    this.dialog.open(TagDocDialogComponent, {
      maxHeight: '750px',
      width: '700px',
      disableClose: true,
      data: {currentProjectId: this.currentProject.id, tagger: element}
    });
  }

  onTagRandomDoc(element: RegexTaggerGroup): void {
    this.dialog.open(TagRandomDocComponent, {
      maxHeight: '750px',
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

  applyTaggerGroup(): void {
    this.dialog.open(ApplyTaggerGroupDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
      data: JSON.parse(JSON.stringify(this.tableData.data)),
      disableClose: true
    });
  }

  onDelete(cluster: RegexTaggerGroup, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this regex tagger group?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const body = {ids: [index]};
        this.regexTaggerGroupService.bulkDeleteRegexTaggerGroupTasks(this.currentProject.id, body).subscribe(() => {
          this.logService.snackBarMessage(`Deleted regex tagger group ${cluster.description}`, 2000);
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
      (this.tableData.data as RegexTaggerGroup[]).forEach(row => this.selectedRows.select(row));
  }


  onDeleteAllSelected(): void {
    if (this.selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${this.selectedRows.selected.length} Regex Tagger Groups?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          const idsToDelete = this.selectedRows.selected.map((regexTaggerGroup: RegexTaggerGroup) => regexTaggerGroup.id);
          const body = {ids: idsToDelete};

          this.regexTaggerGroupService.bulkDeleteRegexTaggerGroupTasks(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(`Deleted ${this.selectedRows.selected.length} Regex Tagger Groups.`, 2000);
            this.removeSelectedRows();
          });
        }
      });
    }
  }

  removeSelectedRows(): void {
    this.selectedRows.selected.forEach((selected: RegexTaggerGroup) => {
      const index: number = (this.tableData.data as RegexTaggerGroup[]).findIndex(regexTaggerGroup => regexTaggerGroup.id === selected.id);
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

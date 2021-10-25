import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, of, Subject, Subscription} from 'rxjs';
import {Lexicon} from '../shared/types/Lexicon';
import {LogService} from '../core/util/log.service';
import {LexiconService} from '../core/lexicon/lexicon.service';
import {ProjectStore} from '../core/projects/project.store';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CreateLexiconDialogComponentComponent} from './create-lexicon-dialog-component/create-lexicon-dialog-component.component';


@Component({
  selector: 'app-lexicon-miner',
  templateUrl: './lexicon-miner.component.html',
  styleUrls: ['./lexicon-miner.component.scss']
})
export class LexiconMinerComponent implements OnInit, OnDestroy, AfterViewInit {

  public tableData: MatTableDataSource<Lexicon> = new MatTableDataSource();
  public displayedColumns = ['id', 'description', 'author', 'positives_used', 'positives_unused', 'negatives_used', 'negatives_unused', 'delete'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  resultsLength: number;
  private updateTable = new Subject<boolean>();

  constructor(private projectStore: ProjectStore,
              private lexiconService: LexiconService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

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

    merge(this.sort.sortChange, this.paginator.page, this.updateTable)
      .pipe(debounceTime(250), startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$));
        }))
      .pipe(
        switchMap(proj => {
          if (proj) {
            const sortDirection = this.sort.direction === 'desc' ? '-' : '';
            return this.lexiconService.getLexicons(
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


  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateLexiconDialogComponentComponent, {
      maxHeight: '90vh',
      width: '800px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((resp: Lexicon | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.updateTable.next(true);
        this.logService.snackBarMessage(`Created Lexicon ${resp.description}`, 2000);
        this.projectStore.refreshSelectedProjectResourceCounts();
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onDelete(lexicon: Lexicon, index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: 'Are you sure you want to delete this Lexicon?'}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lexiconService.deleteLexicon(this.currentProject.id, lexicon.id).subscribe(() => {
          this.logService.snackBarMessage(`Deleted Lexicon ${lexicon.description}`, 2000);
          this.tableData.data.splice(index, 1);
          this.tableData.data = [...this.tableData.data];
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

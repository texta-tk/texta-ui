import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {UserService} from '../../core/users/user.service';
import {LogService} from '../../core/util/log.service';
import {MatDialog} from '@angular/material/dialog';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {Index} from '../../shared/types/Index';
import {CoreService} from '../../core/core.service';


@Component({
  selector: 'app-indices',
  templateUrl: './indices.component.html',
  styleUrls: ['./indices.component.scss']
})
export class IndicesComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projects: Project[];
  public tableData: MatTableDataSource<Index> = new MatTableDataSource<Index>([]);

  public displayedColumns = ['id', 'is_open', 'name', 'size', 'doc_count', 'delete'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  resultsLength: number;
  filterTerm$ = new Subject<string>();

  constructor(private userService: UserService,
              private logService: LogService,
              public dialog: MatDialog,
              private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.filterTerm$.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(x => {
      this.tableData.filter = x.trim().toLowerCase();
      if (this.tableData.paginator) {
        this.tableData.paginator.firstPage();
      }
    });
  }

  ngAfterViewInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.tableData.filterPredicate = this.customFilterPredicate();
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.coreService.getElasticIndices().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.resultsLength = resp.length;
        this.tableData.data = resp;
        this.isLoadingResults = false;
      }
    });
  }

  toggleIndexState(row: Index) {
    this.coreService.toggleElasticIndexOpenState(row).subscribe((resp) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
  }

  deleteIndex(index: Index) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Delete',
        mainText: `Delete index: ${index.id}: ${index.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.coreService.deleteElasticIndex(index.id).subscribe(x => {
          if (!(x instanceof HttpErrorResponse)) {
            this.tableData.data = this.tableData.data.filter(y => y.id !== index.id);
          }
        });
      }
    });
  }

  trackById(index, item: Index) {
    return item.id;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterTerm$.next(filterValue);
  }

  customFilterPredicate() {
    return (data: Index, filter: string) => {
      if (data.name) {
        return data.name.trim().toLowerCase().indexOf(filter.trim().toLowerCase()) !== -1;
      }
      return true;
    };
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

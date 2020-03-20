import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, of, Subject} from 'rxjs';
import {Project} from '../../shared/types/Project';
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {UserService} from '../../core/users/user.service';
import {LogService} from '../../core/util/log.service';
import {MatDialog} from '@angular/material/dialog';
import {ProjectStore} from '../../core/projects/project.store';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {Index} from '../../shared/types/Index';
import {ProjectService} from '../../core/projects/project.service';


@Component({
  selector: 'app-indices',
  templateUrl: './indices.component.html',
  styleUrls: ['./indices.component.scss']
})
export class IndicesComponent implements OnInit, AfterViewInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projects: Project[];
  public tableData: MatTableDataSource<Index> = new MatTableDataSource<Index>([]);

  public displayedColumns = ['id', 'is_open', 'name', 'delete'];
  public isLoadingResults = true;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  currentProject: Project;
  resultsLength = 0;

  constructor(private userService: UserService,
              private logService: LogService,
              public dialog: MatDialog,
              private projectStore: ProjectStore,
              private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.pipe(takeUntil(this.destroyed$)).subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page,
      this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$))).pipe(debounceTime(250),
      switchMap((x: any) => {
        if (x.title) {
          this.currentProject = x;
          this.paginator.pageIndex = 0;
        }
        if (this.currentProject) {
          const sortDirection = this.sort.direction === 'desc' ? '-' : '';
          return this.projectService.getElasticIndices(this.currentProject.id,
            `&ordering=${sortDirection}${this.sort.active}&page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`);
        }
        return of(null);
      })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.resultsLength = resp.count;
        this.tableData.data = resp.results;
        this.isLoadingResults = false;
      }
    });
  }

  toggleIndexState(row: Index) {
    row.is_open = !row.is_open;
    this.projectService.editElasticIndex(row.id, row).subscribe((resp) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 2000);
      }
    });
  }

  deleteIndex(index: Index) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        confirmText: 'Delete',
        mainText: `Are you sure you want to delete index: ${index.id}: ${index.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteElasticIndex(this.currentProject.id, index.id).subscribe(x => {
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

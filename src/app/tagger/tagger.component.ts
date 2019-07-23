import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {of, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LogService} from '../core/util/log.service';
import {TaggerService} from '../core/taggers/tagger.service';
import {ProjectStore} from '../core/projects/project.store';
import {Tagger} from '../shared/types/Tagger';
import {mergeMap} from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-tagger',
  templateUrl: './tagger.component.html',
  styleUrls: ['./tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class TaggerComponent implements OnInit, OnDestroy {

  dialogAfterClosedSubscription: Subscription;
  currentProjectSubscription: Subscription;


  expandedElement: Tagger | null;
  public tableData: MatTableDataSource<Tagger>;
  public displayedColumns = ['Description', 'fields_parsed', 'time_started', 'time_completed', 'Task'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.currentProjectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerService.getTaggers(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Tagger[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData = new MatTableDataSource(resp);
        this.tableData.sort = this.sort;
        this.tableData.paginator = this.paginator;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.dialogAfterClosedSubscription) {
      this.dialogAfterClosedSubscription.unsubscribe();
    }
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTaggerDialogComponent, {
      height: '665px',
      width: '700px',
    });
    this.dialogAfterClosedSubscription = dialogRef.afterClosed().subscribe((resp: Tagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}

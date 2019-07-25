import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {of, Subscription, timer} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {LogService} from '../core/util/log.service';
import {TaggerService} from '../core/taggers/tagger.service';
import {ProjectStore} from '../core/projects/project.store';
import {Tagger} from '../shared/types/Tagger';
import {concatMap, delay, mergeMap, switchMap, take} from 'rxjs/operators';
import {CreateTaggerDialogComponent} from './create-tagger-dialog/create-tagger-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Project} from '../shared/types/Project';

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

  private dialogAfterClosedSubscription: Subscription;
  private currentProjectSubscription: Subscription;
  private updateTaggersSubscription: Subscription;

  expandedElement: Tagger | null;
  public tableData: MatTableDataSource<Tagger> = new MatTableDataSource();
  public displayedColumns = ['description', 'fields_parsed', 'time_started', 'time_completed', 'Task', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;


  constructor(private projectStore: ProjectStore,
              private taggerService: TaggerService,
              public dialog: MatDialog,
              public logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.currentProjectSubscription = this.projectStore.getCurrentProject().pipe(switchMap(currentProject => {
      if (currentProject) {
        return this.taggerService.getTaggers(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Tagger[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = resp;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });
    // check for updates after 30s every 30s
    this.updateTaggersSubscription = this.projectStore.getCurrentProject().pipe(switchMap((currentProject: Project) => {
      return timer(30000, 30000).pipe(switchMap(_ => this.taggerService.getTaggers(currentProject.id)));
    })).subscribe((resp: Tagger[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        if (resp.length > 0) {
          resp.map(tagger => {
            const indx = this.tableData.data.findIndex(x => x.id === tagger.id);
            this.tableData.data[indx].task = tagger.task;
          });
        }
      }
    });
  }

  retrainTagger(value) {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.taggerService.retrainTagger(currentProject.id, value.id);
      } else {
        return null;
      }
    })).pipe(delay(1000)).subscribe(resp => { // delay cause getting a response doesnt actually do anything?
      if (value) {
        this.projectStore.getCurrentProject().pipe(take(1)).subscribe(currentProject => {
          // refresh
          this.projectStore.setCurrentProject(currentProject);
        });
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
    if (this.updateTaggersSubscription) {
      this.updateTaggersSubscription.unsubscribe();
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

import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {startWith, switchMap} from 'rxjs/operators';
import {LogService} from '../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Project} from '../../shared/types/Project';
import {Subscription} from 'rxjs';
import {ProjectStore} from '../../core/projects/project.store';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {TaggerGroup} from '../../shared/types/tasks/Tagger';
import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupService} from '../../core/taggers/tagger-group.service';
import {SelectionModel} from '@angular/cdk/collections';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ModelsListDialogComponent} from './models-list-dialog/models-list-dialog.component';
import {TaggerGroupTagTextDialogComponent} from './tagger-group-tag-text-dialog/tagger-group-tag-text-dialog.component';

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
  public displayedColumns = ['id', 'description', 'fact_name', 'minimum_sample_size', 'Modify'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

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
    this.paginator.page.pipe(startWith({}), switchMap(() => {
      this.isLoadingResults = true;
      return this.taggerGroupService.getTaggerGroups(
        this.currentProject.id,
        // Add 1 to to index because Material paginator starts from 0 and DRF paginator from 1
        `page=${this.paginator.pageIndex + 1}&page_size=${this.paginator.pageSize}`
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

  onDeleteAllSelected() {
    // todo
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTaggerGroupDialogComponent, {
      height: '860px',
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
      height: '835px',
      width: '850px',
      panelClass: 'custom-no-padding-dialog'
    });
  }

  onModelsRetrain(taggerGroup: TaggerGroup) {
    this.taggerGroupService.modelsRetrain(taggerGroup.id, this.currentProject.id).subscribe(
      (resp: { 'success': 'retraining tasks created' } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage('Started retraining loggers', 3000);
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
}

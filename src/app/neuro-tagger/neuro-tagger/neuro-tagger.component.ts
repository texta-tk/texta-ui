import {Component, OnInit, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Project} from '../../shared/types/Project';
import {NeuroTagger} from '../../shared/types/tasks/NeuroTagger';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {NeuroTaggerService} from '../../core/neuro-tagger/neuro-tagger.service';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';
import {CreateNeuroTaggerDialogComponent} from '../create-neuro-tagger-dialog/create-neuro-tagger-dialog.component';

@Component({
  selector: 'app-neuro-tagger',
  templateUrl: './neuro-tagger.component.html',
  styleUrls: ['./neuro-tagger.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])]
})
export class NeuroTaggerComponent implements OnInit {
  expandedElement: NeuroTagger | null;
  public tableData: MatTableDataSource<NeuroTagger> = new MatTableDataSource();
  public displayedColumns = ['description', 'fields_parsed', 'time_started',
    'time_completed', 'Task', 'Modify'];
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  currentProject: Project;

  constructor(private projectStore: ProjectStore,
              public dialog: MatDialog,
              private neuroTaggerService: NeuroTaggerService,
              private logService: LogService) {
  }

  ngOnInit() {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.neuroTaggerService.getNeuroTaggers(this.currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: NeuroTagger[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = resp;
        this.isLoadingResults = false;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
        this.isLoadingResults = false;
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateNeuroTaggerDialogComponent, {
      maxHeight: '765px',
      width: '700px',
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe((resp: NeuroTagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
/*

  tagTextDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagDocDialogComponent, {
      data: {tagger: tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: Tagger) {
    const dialogRef = this.dialog.open(TagRandomDocDialogComponent, {
      data: {tagger: tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      maxWidth: '1200px',
    });
  }
*/

}

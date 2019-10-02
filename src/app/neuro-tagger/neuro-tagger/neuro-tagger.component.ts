import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatDialog, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Project} from '../../shared/types/Project';
import {NeuroTagger} from '../../shared/types/tasks/NeuroTagger';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject, timer, Subscription} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {NeuroTaggerService} from '../../core/neuro-tagger/neuro-tagger.service';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';
import {CreateNeuroTaggerDialogComponent} from '../create-neuro-tagger-dialog/create-neuro-tagger-dialog.component';
import { NeurotagTextDialogComponent } from '../neurotag-text-dialog/neurotag-text-dialog.component';
import { NeurotagDocDialogComponent } from '../neurotag-doc-dialog/neurotag-doc-dialog.component';
import { NeurotagRandomDocDialogComponent } from '../neurotag-random-doc-dialog/neurotag-random-doc-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { GenericDialogComponent } from 'src/app/shared/components/dialogs/generic-dialog/generic-dialog.component';

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
export class NeuroTaggerComponent implements OnInit, OnDestroy {
  expandedElement: NeuroTagger | null;
  public tableData: MatTableDataSource<NeuroTagger> = new MatTableDataSource();
  public displayedColumns = ['select', 'description', 'fields_parsed', 'time_started', 'time_completed', 'Task', 'Modify'];
  selectedRows = new SelectionModel<NeuroTagger>(true, []);
  public isLoadingResults = true;

  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  currentProject: Project;
  updateTaggersSubscription: Subscription;

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

    // check for updates after 30s every 30s
    timer(30000, 30000).pipe(takeUntil(this.destroyed$), switchMap(_ => this.neuroTaggerService.getNeuroTaggers(this.currentProject.id)))
    .subscribe((resp: NeuroTagger[] | HttpErrorResponse) => {
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

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateNeuroTaggerDialogComponent, {
      maxHeight: '765px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe((resp: NeuroTagger | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.tableData.data = [...this.tableData.data, resp];
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }


  tagTextDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagTextDialogComponent, {
      data: {taggerId: tagger.id, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }

  tagDocDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagDocDialogComponent, {
      data: {tagger: tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      width: '700px',
    });
  }


  tagRandomDocDialog(tagger: NeuroTagger) {
    const dialogRef = this.dialog.open(NeurotagRandomDocDialogComponent, {
      data: {neurotagger: tagger, currentProjectId: this.currentProject.id},
      maxHeight: '665px',
      maxWidth: '1200px',
    });
  }

  onDelete(neurotagger: NeuroTagger, index: number) {
    this.neuroTaggerService.deleteNeuroTagger(this.currentProject.id, neurotagger.id).subscribe(() => {
      this.logService.snackBarMessage(`NeuroTagger ${neurotagger.id}: ${neurotagger.description} deleted`, 2000);
      this.tableData.data.splice(index, 1);
      this.tableData.data = [...this.tableData.data]
    })
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.tableData.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selectedRows.clear() :
        this.tableData.data.forEach(row => this.selectedRows.select(row));
  }


  onDelteAllSelected() {
    if (this.selectedRows.selected.length > 0) {
      // Delete selected taggers
      const ids_to_delete = this.selectedRows.selected.map((tagger: NeuroTagger) => { return tagger.id });
      const body = {"ids": ids_to_delete}
      // Refresh taggers
      this.neuroTaggerService.bulkDeleteNeuroTaggers(this.currentProject.id, body).subscribe(() => {
        this.logService.snackBarMessage(`${this.selectedRows.selected.length} NeuroTaggers deleted`, 2000);
        this.removeSelectedRows();
      });
    }
  }

  removeSelectedRows() {
    this.selectedRows.selected.forEach((selected_tagger: NeuroTagger) => {
       const index: number = this.tableData.data.findIndex(tagger => tagger.id === selected_tagger.id);
        this.tableData.data.splice(index, 1);
        this.tableData.data = [...this.tableData.data];
     });
     this.selectedRows.clear();
  }

  openGenericDialog(data: string) {
    data = JSON.parse(data);
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      data: {data: data},
      maxHeight: '665px',
      width: '700px',
    });    
  }
}

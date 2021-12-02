import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../core/projects/project.store';
import {ProjectService} from '../../../core/projects/project.service';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-facts-filter-dialog',
  templateUrl: './facts-filter-dialog.component.html',
  styleUrls: ['./facts-filter-dialog.component.scss']
})
export class FactsFilterDialogComponent implements OnInit, OnDestroy {
  destroyed$: Subject<boolean> = new Subject<boolean>();
  displayedFacts: string[] = [];
  projectFacts: BehaviorSubject<string[]> = new BehaviorSubject(['Loading...']);

  // selectedFacts = already filtered facts that the user has selected before
  constructor(@Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number; selectedFacts: string[] | undefined },
              private projectStore: ProjectStore,
              private dialogRef: MatDialogRef<FactsFilterDialogComponent>,
              private logService: LogService,
              private projectService: ProjectService) {
  }

  ngOnInit(): void {
    if (this.data.currentProjectId) {
      this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$), switchMap(currentProjIndices => {
        if (currentProjIndices) {
          this.projectFacts.next(['Loading...']);
          return this.projectService.getProjectFacts(this.data.currentProjectId, currentProjIndices.map(x => [{name: x.index}]).flat());
        } else {
          return of(null);
        }
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          if (this.data.selectedFacts) {
            this.displayedFacts = this.data.selectedFacts;
          } else {
            this.displayedFacts = resp;
          }
          this.projectFacts.next(resp);
        } else if (resp) {
          this.logService.snackBarError(resp, 4000);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

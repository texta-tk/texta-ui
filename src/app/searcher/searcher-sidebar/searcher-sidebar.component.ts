import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ProjectField} from '../../shared/types/Project';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../core/projects/project.store';
import {ProjectService} from '../../core/projects/project.service';
import {of, Subject} from 'rxjs';
import {LogService} from '../../core/util/log.service';
import {BuildSearchComponent} from './build-search/build-search.component';

@Component({
  selector: 'app-searcher-sidebar',
  templateUrl: './searcher-sidebar.component.html',
  styleUrls: ['./searcher-sidebar.component.scss']
})
export class SearcherSidebarComponent implements OnInit, OnDestroy {
  projectFields: ProjectField[];
  destroy$: Subject<boolean> = new Subject();
  @ViewChild(BuildSearchComponent, {static: false})
  private buildSearchComponent: BuildSearchComponent;

  constructor(private projectStore: ProjectStore, private projectService: ProjectService, private logService: LogService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap(currentProject => {
      if (currentProject) {
        return this.projectService.getProjectFields(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: ProjectField[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFields = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  notifyBuildSearch(savedSearch: number) { // todo object
    console.log(savedSearch);
    this.buildSearchComponent.buildSavedSearch(savedSearch);
  }

}

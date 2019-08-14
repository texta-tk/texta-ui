import {Component, OnInit} from '@angular/core';
import {ProjectField} from '../../shared/types/Project';
import {mergeMap} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../core/projects/project.store';
import {ProjectService} from '../../core/projects/project.service';
import {of} from 'rxjs';
import {LogService} from '../../core/util/log.service';

@Component({
  selector: 'app-searcher-sidebar',
  templateUrl: './searcher-sidebar.component.html',
  styleUrls: ['./searcher-sidebar.component.scss']
})
export class SearcherSidebarComponent implements OnInit {
  projectFields: ProjectField[];

  constructor(private projectStore: ProjectStore, private projectService: ProjectService, private logService: LogService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(mergeMap(currentProject => {
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

}

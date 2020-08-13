import {ChangeDetectionStrategy, Component, DoCheck, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from './services/searcher-component.service';
import {concatMap, distinctUntilChanged, map, skipWhile, switchMap, take, takeUntil} from 'rxjs/operators';
import {combineLatest, of, Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ProjectStore} from '../core/projects/project.store';
import {Project} from '../shared/types/Project';
import {ProjectService} from '../core/projects/project.service';

@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss'],
  providers: [SearcherComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearcherComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  isSearch = true;
  isAggregation = false;
  currentProject: Project;
  projects: Project[] = [];
  routeParamProjId: number;
  routeParamIndices: string[] = [];

  constructor(private searchService: SearcherComponentService, private route: ActivatedRoute, private router: Router,
              private projectStore: ProjectStore, private projectService: ProjectService) {
  }

  ngOnInit(): void {
    const routeIntialized = new Subject<boolean>();
    routeIntialized.pipe(take(1), switchMap(x => {
      return combineLatest([this.projectStore.getCurrentProject(), this.projectStore.getSelectedProjectIndices()]).pipe(
        takeUntil(this.destroy$), distinctUntilChanged(),
        map(([a$, b$]) => ({
          project: a$,
          indices: b$,
        })));
    })).subscribe((resp) => {
      if (resp && resp.project) {
        const url = `searcher/${resp.project.id}/${resp.indices !== null ? resp.indices.map(x => x.index).join(',') : ''}`;
        this.router.navigate([url]);
      }
    });


    this.projectStore.getProjects().pipe(skipWhile(x => x === null), switchMap(projects => {
      if (projects) {
        this.projects = projects;
        return this.route.params;
      }
      return of(null);
    }), take(1)).pipe(concatMap(rout => {
      if (rout?.projectId) {
        if (rout.index) {
          this.routeParamIndices = rout.index.split(',');
        }
        if (rout.projectId) {
          this.routeParamProjId = +rout.projectId;
        }
        return of(this.projects);
      }
      routeIntialized.next(true); // no route path just empty /searcher/
      return of(null);
    }), take(1)).pipe(concatMap(projects => {
      if (projects) {
        const project = projects.find(x => x.id === +this.routeParamProjId);
        if (project) {
          this.projectStore.setCurrentProject(project);
          if (this.routeParamIndices.length > 0) {
            return this.projectStore.getSelectedProjectIndices().pipe(skipWhile(x => x === null), take(1));
          } else {
            routeIntialized.next(true); // no indices specified
          }
        }
      }
      routeIntialized.next(true); // project doesnt exist
      return of(null);
    })).subscribe(projectIndices => {
      if (projectIndices) {
        const indices = projectIndices.filter(x => this.routeParamIndices.includes(x.index));
        this.projectStore.setSelectedProjectIndices(indices);
        routeIntialized.next(true);
      }
    });

    this.searchService.getSearch().pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (value) {
        this.isAggregation = false;
        this.isSearch = true;
      }
    });
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe(aggregation => {
      if (aggregation) {
        this.isSearch = false;
        this.isAggregation = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

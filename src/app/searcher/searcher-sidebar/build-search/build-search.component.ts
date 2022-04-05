import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Search} from '../../../shared/types/Search';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {AdvancedSearchComponent} from './advanced-search/advanced-search.component';
import {SimpleSearchComponent} from './simple-search/simple-search.component';
import {ProjectStore} from '../../../core/projects/project.store';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {LocalStorageService} from '../../../core/util/local-storage.service';
import {Project} from '../../../shared/types/Project';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Output() searchButtonClick = new EventEmitter<Search>();
  highlightMatching = false;
  showShortVersion = true;
  highlightSearcherMatches = true;
  highlightTextaFacts = true;
  showShortVersionContext = 6;
  searcherType: 1 | 2;
  @ViewChild(AdvancedSearchComponent)
  private advancedSearchComponent: AdvancedSearchComponent;
  @ViewChild(SimpleSearchComponent)
  private simpleSearchComponent: SimpleSearchComponent;
  private destroyed$: Subject<boolean> = new Subject<boolean>();
  private currentProject: Project;

  constructor(
    public searchService: SearcherComponentService,
    private localStorageService: LocalStorageService,
    private changeDetectorRef: ChangeDetectorRef,
    private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        const state = this.localStorageService.getProjectState(proj);
        if (state?.searcher?.searcherType) {
          this.searcherType = state.searcher.searcherType;
        } else {
          this.searcherType = 1;
        }
        if (state?.searcher?.showShortVersion) {
          this.showShortVersion = state.searcher.showShortVersion;
        } else {
          this.showShortVersion = false;
        }
        this.changeDetectorRef.markForCheck();
      }
    });

    this.searchService.getSavedSearch().pipe(takeUntil(this.destroyed$)).subscribe(search => {
      if (search) {
        const constraints = JSON.parse(search.query_constraints as string);
        if (constraints.length === 0) {
          this.searcherType = 1;
          this.saveTypeSelection(1);
        } else {
          this.searcherType = 2;
          this.saveTypeSelection(2);
        }
        // if someone saves an empty search it wont trigger changedetection in the child, so just do it here
        // so the layout wouldnt change when the user triggers changedetection by interacting with the component
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  queryNewSearch(): void {
    if (this.searcherType === 2) {
      this.advancedSearchComponent.searchQueue$.next();
    } else {
      this.simpleSearchComponent.searchQueue$.next();
    }
  }

  saveTypeSelection(saveType: 1 | 2): void {
    // update query when changing tabs
    if (saveType === 1) {
      this.simpleSearchComponent.makeQuery(this.simpleSearchComponent.searchFormControl.value);
    } else {
      this.advancedSearchComponent.searchOnChange(this.advancedSearchComponent.elasticQuery);
    }

    const state = this.localStorageService.getProjectState(this.currentProject);
    if (state?.searcher?.searcherType) {
      state.searcher.searcherType = saveType;
      this.localStorageService.updateProjectState(this.currentProject, state);
    }
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  showShortVersionChange($event: boolean): void {
    const state = this.localStorageService.getProjectState(this.currentProject);
    if (state?.searcher) {
      state.searcher.showShortVersion = $event;
      this.localStorageService.updateProjectState(this.currentProject, state);
    }
  }
}

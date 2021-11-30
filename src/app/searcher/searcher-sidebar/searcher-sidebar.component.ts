import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {SaveSearchDialogComponent} from './dialogs/save-search-dialog/save-search-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {SavedSearchesComponent} from './saved-searches/saved-searches.component';
import {ConfirmDialogComponent} from '../../shared/shared-module/components/dialogs/confirm-dialog/confirm-dialog.component';
import {SearcherService} from '../../core/searcher/searcher.service';
import {Project, ProjectState} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';
import {SearcherComponentService} from '../services/searcher-component.service';
import {SavedSearch} from '../../shared/types/SavedSearch';
import {GenericDialogComponent} from '../../shared/shared-module/components/dialogs/generic-dialog/generic-dialog.component';
import {LocalStorageService} from '../../core/util/local-storage.service';

@Component({
  selector: 'app-searcher-sidebar',
  templateUrl: './searcher-sidebar.component.html',
  styleUrls: ['./searcher-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearcherSidebarComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();
  aggregationElasticQuery = {};
  buildSearchExpanded = false;
  savedSearchesExpanded = false;
  aggregationsExpanded = false;
  currentProject: Project;
  @ViewChild(SavedSearchesComponent)
  private savedSearchesComponent: SavedSearchesComponent;
  @ViewChild('buildSearchPanel', {read: ElementRef})
  private buildSearchComponent: ElementRef;

  constructor(public dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef,
              private searcherService: SearcherService,
              private searchComponentService: SearcherComponentService,
              private projectStore: ProjectStore,
              private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        const localStorageState = this.localStorageService.getProjectState(proj);
        // compatibility for when searcher localstorage didnt have this yet
        if (localStorageState?.searcher) {
          if (!localStorageState.searcher.sidePanelsState) {
            localStorageState.searcher.sidePanelsState = {
              savedSearch: true,
              buildSearch: true,
              aggregations: false
            };
          }
          this.buildSearchExpanded = localStorageState.searcher.sidePanelsState.buildSearch;
          this.savedSearchesExpanded = localStorageState.searcher.sidePanelsState.savedSearch;
          this.aggregationsExpanded = localStorageState.searcher.sidePanelsState.aggregations;
        }
        this.changeDetectorRef.markForCheck();
      }
    });
    this.searchComponentService.getSavedSearch().pipe(takeUntil(this.destroy$)).subscribe(search => {
      if (search) {
        this.buildSearchComponent.nativeElement.scrollIntoView();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  expandBuildSearchPanel(): void {
    this.buildSearchExpanded = !this.buildSearchExpanded;
    const localStorageState = this.localStorageService.getProjectState(this.currentProject);
    if (localStorageState) {
      localStorageState.searcher.sidePanelsState.buildSearch = this.buildSearchExpanded;
      this.localStorageService.updateProjectState(this.currentProject, localStorageState);
    }
  }

  expandSavedSearchesPanel(): void {
    this.savedSearchesExpanded = !this.savedSearchesExpanded;
    const localStorageState = this.localStorageService.getProjectState(this.currentProject);
    if (localStorageState) {
      localStorageState.searcher.sidePanelsState.savedSearch = this.savedSearchesExpanded;
      this.localStorageService.updateProjectState(this.currentProject, localStorageState);
    }
  }

  expandAggregationsPanel(): void {
    this.aggregationsExpanded = !this.aggregationsExpanded;
    const localStorageState = this.localStorageService.getProjectState(this.currentProject);
    if (localStorageState) {
      localStorageState.searcher.sidePanelsState.aggregations = this.aggregationsExpanded;
      this.localStorageService.updateProjectState(this.currentProject, localStorageState);
    }
  }

  openViewQueryDialog(): void {
    this.searchComponentService.getElasticQuery().pipe(take(1)).subscribe(x => {
      if (x) {
        this.dialog.open(GenericDialogComponent, {
          data: {
            data: {query: x.elasticSearchQuery.query}
          },
          maxHeight: '500px',
          maxWidth: '500px'
        });
      }
    });

  }

  openSaveSearchDialog(): void {
    this.searchComponentService.getElasticQuery().pipe(take(1)).subscribe(x => {
      if (x) {
        this.dialog.open(SaveSearchDialogComponent, {
          maxHeight: '300px',
          width: '500px',
          data: {
            query: x.elasticSearchQuery.query
          },
        });
      }
    });
  }

  onDeleteAllSelected(): void {
    const selectedRows = this.searchComponentService.savedSearchSelection;
    if (selectedRows.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          confirmText: 'Delete',
          mainText: `Are you sure you want to delete ${selectedRows.selected.length} Searches?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const idsToDelete = selectedRows.selected.map((savedSearch: SavedSearch) => savedSearch.id);
          const body = {ids: idsToDelete};
          this.searcherService.bulkDeleteSavedSearches(this.currentProject.id, body).subscribe(() => {
            this.logService.snackBarMessage(
              `Deleted ${selectedRows.selected.length > 1 ? selectedRows.selected.length : ''} search${selectedRows.selected.length > 1 ? 'es' : ''}`, 2000);
            this.savedSearchesComponent.removeSelectedRows();
          });
        }
      });
    }
  }

  openAggregationViewQueryDialog(): void {
    this.dialog.open(GenericDialogComponent, {
      data: {
        data: {query: this.aggregationElasticQuery}
      },
      maxHeight: '90vh',
      maxWidth: '90vw'
    });
  }
}

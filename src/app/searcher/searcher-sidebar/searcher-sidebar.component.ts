import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {BuildSearchComponent} from './build-search/build-search.component';
import {takeUntil} from 'rxjs/operators';
import {SaveSearchDialogComponent} from './dialogs/save-search-dialog/save-search-dialog.component';
import {MatDialog} from '@angular/material';

@Component({
  selector: 'app-searcher-sidebar',
  templateUrl: './searcher-sidebar.component.html',
  styleUrls: ['./searcher-sidebar.component.scss']
})
export class SearcherSidebarComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();
  @ViewChild(BuildSearchComponent, {static: false})
  private buildSearchComponent: BuildSearchComponent;
  @ViewChild('buildSearchPanel', {static: false}) buildSearchPanel: any;
  @ViewChild('savedSearchesPanel', {static: false}) savedSearchesPanel: any;
  buildSearchExpanded = true;
  savedSearchesExpanded = true;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  expandBuildSearchPanel() {
    this.buildSearchExpanded = !this.buildSearchExpanded;
  }

  expandSavedSearchesPanel() {
    this.savedSearchesExpanded = !this.savedSearchesExpanded;
  }

  openSaveSearchDialog() {
    const dialogRef = this.dialog.open(SaveSearchDialogComponent, {
      maxHeight: '300px',
      width: '300px'
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((resp: string) => {
      if (resp) {
        console.log(this.buildSearchComponent.saveSearch(resp));
      }
    });
  }

  notifyBuildSearch(savedSearch: any) { // todo object
    this.buildSearchComponent.buildSavedSearch(savedSearch);
  }

}

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {of, Subject} from 'rxjs';
import {BuildSearchComponent} from './build-search/build-search.component';

@Component({
  selector: 'app-searcher-sidebar',
  templateUrl: './searcher-sidebar.component.html',
  styleUrls: ['./searcher-sidebar.component.scss']
})
export class SearcherSidebarComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject();
  @ViewChild(BuildSearchComponent, {static: false})
  private buildSearchComponent: BuildSearchComponent;

  constructor() {
  }

  ngOnInit() {

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

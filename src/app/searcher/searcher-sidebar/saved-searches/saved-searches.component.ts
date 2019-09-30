import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit, OnDestroy {
  @Output() savedSearchClick = new EventEmitter<number>(); // search object future todo
  displayedColumns: string[] = ['select', 'name', 'url'];
  selection = new SelectionModel<any>(true, []);

  dataSource: MatTableDataSource<any>;
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private searcherService: SearcherService) {
  }

  ngOnInit() {
    this.searcherService.getSavedSearches().pipe(takeUntil(this.destroyed$)).subscribe(searches => {
      if (searches) {
        console.log(searches);
        this.dataSource = new MatTableDataSource<any>(searches);
      }
    });
  }

  displaySavedSearch(element) {
    this.savedSearchClick.emit(element);
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

}

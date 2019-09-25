import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';
import {SearcherService} from '../../../core/searcher/searcher.service';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit {
  @Output() savedSearchClick = new EventEmitter<number>(); // search object future todo
  displayedColumns: string[] = ['select', 'name', 'url'];
  selection = new SelectionModel<any>(true, []);
  mockData =
    [
      {
        id: 0,
        name: 'search: 1',
      },
      {
        id: 2,
        name: 'search: 2',
      },
      {
        id: 3,
        name: 'search: 3',
      },
      {
        id: 4,
        name: 'search: 4',
      }];
  dataSource = new MatTableDataSource<any>(this.mockData);

  constructor() {
  }

  ngOnInit() {
  }

  displaySavedSearch(id) {
    this.savedSearchClick.emit(id);
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

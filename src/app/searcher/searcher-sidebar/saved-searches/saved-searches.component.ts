import {Component, OnInit} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-saved-searches',
  templateUrl: './saved-searches.component.html',
  styleUrls: ['./saved-searches.component.scss']
})
export class SavedSearchesComponent implements OnInit {
  displayedColumns: string[] = ['select', 'name', 'url' ];
  selection = new SelectionModel<any>(true, []);
  mockData =
    [
      {
        id: 1,
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

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}

import {Component, Input, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {MatDialog} from '@angular/material/dialog';
import {AddLexiconDialogComponent} from '../../../shared/components/dialogs/add-lexicon-dialog/add-lexicon-dialog.component';

interface TableElement {
  doc_count: number;
  key: string;
  top_reverse_nested: { doc_count: number };
}

@Component({
  selector: 'app-aggregation-result-table',
  templateUrl: './aggregation-result-table.component.html',
  styleUrls: ['./aggregation-result-table.component.scss'],
})
export class AggregationResultTableComponent {
  tableDataSource: MatTableDataSource<TableElement>;
  expandedElement: TableElement | null;
  displayedColumns = ['select', 'key', 'doc_count'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  selection = new SelectionModel<TableElement>(true, []);

  constructor(
    public dialog: MatDialog) {
  }

  @Input()
  set tableData(value: MatTableDataSource<TableElement>) {
    if (value && value.data.length > 0) {
      this.tableDataSource = value;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      if (Object.keys(value.data[0]).includes('score')) {
        this.displayedColumns.push('score');
      }
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.tableDataSource.data.forEach(row => this.selection.select(row));
  }

  openLexiconDialog(selected: TableElement[]): void {
    this.dialog.open(AddLexiconDialogComponent, {
      maxHeight: '90vh',
      width: '800px',
      data: selected.map(x => x.key)
    });
  }
}

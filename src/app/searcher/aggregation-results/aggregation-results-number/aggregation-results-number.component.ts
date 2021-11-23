import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {MatPaginator} from "@angular/material/paginator";
import {SelectionModel} from "@angular/cdk/collections";
import {MatDialog} from "@angular/material/dialog";
import {SearcherComponentService} from "../../services/searcher-component.service";
import {AddLexiconDialogComponent} from "../../../shared/components/dialogs/add-lexicon-dialog/add-lexicon-dialog.component";
interface TableElement {
  value: number;
  key: string;
}

@Component({
  selector: 'app-aggregation-results-number',
  templateUrl: './aggregation-results-number.component.html',
  styleUrls: ['./aggregation-results-number.component.scss']
})
export class AggregationResultsNumberComponent {
  tableDataSource: MatTableDataSource<TableElement>;
  expandedElement: TableElement | null;
  displayedColumns = ['value'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  selection = new SelectionModel<TableElement>(true, []);
  @Input() docPath: string;

  constructor(
    public dialog: MatDialog) {
  }

  @Input()
  set tableData(value: MatTableDataSource<TableElement>) {
    if (value) {
      this.tableDataSource = value;
      this.tableDataSource.paginator = this.paginator;
      this.tableDataSource.sort = this.sort;
      if (value.data.length > 0 && Object.keys(value.data[0]).includes('percent')) {
        this.displayedColumns.unshift('percentile');
      }else{
        this.displayedColumns.unshift('key');
      }
    }
  }

}

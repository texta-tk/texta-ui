import {Component, Input, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTableDataSource} from '@angular/material';
import {AggregationResultsDialogComponent} from '../aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-aggregation-results-tree',
  templateUrl: './aggregation-results-tree.component.html',
  styleUrls: ['./aggregation-results-tree.component.scss']
})
export class AggregationResultsTreeComponent implements OnInit {
  @Input() dataSource;
  treeControl = new NestedTreeControl<any>(node => node.buckets);
  hasChild = (_: number, node: any) => !!node.buckets && node.buckets.length > 0;
  bucketAccessor = (x: any) => (x.buckets);

  constructor(  public dialog: MatDialog) { }

  ngOnInit() {
  }
  openDialog(val) {
    if (this.bucketAccessor(val)[0].key_as_string) {
      this.dialog.open(AggregationResultsDialogComponent, {
        data: {
          aggData: [{
            name: val.key,
            series: this.formatDateData(this.bucketAccessor(val))
          }], type: 'histo'
        },
        height: '95%',
        width: '90%',
      });
    } else {
      this.dialog.open(AggregationResultsDialogComponent, {
        data: {
          aggData: new MatTableDataSource(this.bucketAccessor(val)), type: 'table'
        },
        height: '95%',
        width: '90%',
      });
    }
  }
  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]) {
    const dateData = [];
    for (const element of buckets) {
      dateData.push({value: element.doc_count, name: element.key_as_string});
    }
    return dateData;
  }

}

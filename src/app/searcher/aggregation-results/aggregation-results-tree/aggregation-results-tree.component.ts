import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTableDataSource} from '@angular/material/table';
import {AggregationResultsDialogComponent} from '../aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-aggregation-results-tree',
  templateUrl: './aggregation-results-tree.component.html',
  styleUrls: ['./aggregation-results-tree.component.scss'],
})
export class AggregationResultsTreeComponent implements OnInit, OnDestroy {
  @Input() dataSource;
  treeControl: NestedTreeControl<any> = new NestedTreeControl<any>(node => node.buckets);

  destroy$: Subject<boolean> = new Subject();

  constructor(public dialog: MatDialog, private searchComponentService: SearcherComponentService) {
  }

  hasChild = (_: number, node: any) => !!node.buckets && node.buckets.length > 0;

  bucketAccessor = (x: any) => (x.buckets);

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
    const dateData: any[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: element.key_as_string
      });
    }
    return dateData;
  }

  makeSearch(childNode) {
    this.dataSource.forEach(x => {
      if (this.treeControl.isExpanded(x)) {
        if (x.buckets.includes(childNode)) {
          this.searchComponentService.createConstraintFromFact(x.key, childNode.key);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

import {Component, Input, OnDestroy} from '@angular/core';
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
export class AggregationResultsTreeComponent implements OnDestroy {
  // tslint:disable-next-line:no-any
  @Input() dataSource: any[] | undefined;
  // for creating constraints
  @Input() docPaths: string[];
  // tslint:disable-next-line:no-any
  treeControl: NestedTreeControl<any> = new NestedTreeControl<any>(node => node.buckets);

  destroy$: Subject<boolean> = new Subject();

  constructor(public dialog: MatDialog, private searchComponentService: SearcherComponentService) {
  }

  // tslint:disable-next-line:no-any
  hasChild = (_: number, node: any) => !!node.buckets && node.buckets.length > 0;

  // tslint:disable-next-line:no-any
  bucketAccessor = (x: any) => (x.buckets);

  openDialog(val: { key: string; }, depth: number): void {
    if (Object.keys(val).includes('agg_histo')) {
      this.dialog.open(AggregationResultsDialogComponent, {
        data: {
          docPaths: [this.docPaths[depth + 1]],
          aggData: [{
            name: val.key,
            series: this.formatDateData(this.bucketAccessor(val))
          }], type: 'histo'
        },
        height: '95%',
        width: '90%',
      });
    } else {
      if (this.docPaths.length >= depth) {
        const isTextaFactsNode = this.docPaths[depth] === 'texta_facts' || this.docPaths[depth + 1] === 'texta_facts';
        this.dialog.open(AggregationResultsDialogComponent, {
          data: {
            docPaths: isTextaFactsNode ? undefined : [this.docPaths[depth + 1]],
            aggData: new MatTableDataSource(this.bucketAccessor(val)), type: 'table'
          },
          height: '95%',
          width: '90%',
        });
      }
    }
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]): { value: number, name: string; epoch: number }[] {
    // tslint:disable-next-line:no-any
    const dateData: { value: number, name: string; epoch: number }[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: element.key_as_string,
        epoch: element.key,
      });
    }
    return dateData;
  }

  makeSearch(childNode: { key: string; }): void {
    // @ts-ignore
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

  makeFactNameConstraint(node: { key: string; }): void {
    if (node.key) {
      this.searchComponentService.buildFactNameSearch(node.key);
    }
  }
}

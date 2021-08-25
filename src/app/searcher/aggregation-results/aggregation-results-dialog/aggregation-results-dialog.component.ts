import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-aggregation-results-dialog',
  templateUrl: './aggregation-results-dialog.component.html',
  styleUrls: ['./aggregation-results-dialog.component.scss', '../aggregation-results.component.scss']
})
export class AggregationResultsDialogComponent implements OnInit {
  type: 'table' | 'histo' | undefined = undefined;
  // tslint:disable-next-line:no-any
  aggData: MatTableDataSource<any> | any;
  // for creating constraints
  docPath: string;

  constructor(private dialogRef: MatDialogRef<AggregationResultsDialogComponent>,
              // tslint:disable-next-line:no-any
              @Inject(MAT_DIALOG_DATA) public data: { type: 'table' | 'histo', aggData: MatTableDataSource<any> | any, docPath: string; }) {
    if (data.type === 'table') {
      // tslint:disable-next-line:no-any
      this.aggData = data.aggData as MatTableDataSource<any>;
      if (this.data.docPath) {
        this.docPath = this.data.docPath;
      }
    }
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.type = this.data.type;
      if (this.type === 'histo') {
        this.data.aggData = this.data.aggData.slice(0, 50);
        for (const element of this.data.aggData) {
          element.series = element.series.filter((x: { value: number; }) => x.value > 0);
        }
      }
      this.aggData = this.data.aggData;
    }, 250); // wait for dialog animation
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

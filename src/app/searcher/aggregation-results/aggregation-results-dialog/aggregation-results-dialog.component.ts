import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-aggregation-results-dialog',
  templateUrl: './aggregation-results-dialog.component.html',
  styleUrls: ['./aggregation-results-dialog.component.scss', '../aggregation-results.component.scss']
})
export class AggregationResultsDialogComponent implements OnInit {
  type: 'table' | 'histo' | undefined = undefined;
  aggData = [];

  constructor(private dialogRef: MatDialogRef<AggregationResultsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { type: 'table' | 'histo', aggData: MatTableDataSource<any> | any }) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.type = this.data.type;
      if (this.type === 'histo') {
        this.data.aggData = this.data.aggData.slice(0, 50);
        for (const element of this.data.aggData) {
          element.series = element.series.filter(x => x.value > 0);
        }
      }
      this.aggData = this.data.aggData;
    }, 150);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-aggregation-results-dialog',
  templateUrl: './aggregation-results-dialog.component.html',
  styleUrls: ['./aggregation-results-dialog.component.scss']
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
      this.aggData = this.data.aggData.slice(0, 150);
    }, 150);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

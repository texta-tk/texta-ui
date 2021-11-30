import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-plot-download-dialog',
  templateUrl: './plot-download-dialog.component.html',
  styleUrls: ['./plot-download-dialog.component.scss']
})
export class PlotDownloadDialogComponent implements OnInit {
  config = {
    format: 'png',
    width: 1024,
    height: 800,
    filename: 'texta_tk_graph', // plotly config uses lowercase filename so dont change to camelcase
    scale: 1
  };

  constructor(public dialogRef: MatDialogRef<PlotDownloadDialogComponent>) {
  }

  ngOnInit(): void {
  }

}

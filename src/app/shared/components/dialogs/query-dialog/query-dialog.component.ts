import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-query-dialog',
  templateUrl: './query-dialog.component.html',
  styleUrls: ['./query-dialog.component.scss']
})
export class QueryDialogComponent implements OnInit {
  query: unknown;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { query: string; }) { }

  ngOnInit() {
    this.query = JSON.parse(this.data.query);
  }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-generic-dialog',
  templateUrl: './generic-dialog.component.html',
  styleUrls: ['./generic-dialog.component.scss']
})
export class GenericDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { data: string; observableData?: Observable<unknown> }) { }

}

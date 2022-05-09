import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-plot-edit-data-dialog',
  templateUrl: './plot-edit-data-dialog.component.html',
  styleUrls: ['./plot-edit-data-dialog.component.scss']
})
export class PlotEditDataDialogComponent implements OnInit {
  objectKeys: string[] = [];
  typeMap: Map<string, string> = new Map<string, string>();
  // tslint:disable-next-line:no-any
  objectMap: any = {};

  constructor(
    // tslint:disable-next-line:no-any
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<PlotEditDataDialogComponent>) {
  }

  ngOnInit(): void {
    this.objectKeys = Object.keys(this.data).filter(x => x !== 'type');
    this.objectKeys.forEach(x => {
      const type = typeof this.data[x];
      if (this.isArrayOfStrings(this.data[x])) {
        this.objectMap[x] = this.stringListToString(this.data[x]);
      }
      this.typeMap.set(x, type);
    });
  }

  stringListToString(stringList: string[]): string {
    let returnStr = '';
    if (stringList) {
      stringList.forEach(x => {
        returnStr += x + '\n';
      });
    }
    return returnStr;
  }

  newLineStringToList(stringWithNewLines: string, maxAmount: number): string[] {
    const stringList = stringWithNewLines.split('\n');
    // filter out empty values
    return stringList.filter(x => x !== '').slice(0, maxAmount);
  }

  // tslint:disable-next-line:no-any
  onCloseDialog(): void {
    const keys = Object.keys(this.objectMap);
    for (const key of keys) {
      this.data[key] = this.newLineStringToList(this.objectMap[key] as string, this.data[key].length);
    }
    this.dialogRef.close(this.data);
  }

  // tslint:disable-next-line:no-any
  isArrayOfStrings(value: any): boolean {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

}

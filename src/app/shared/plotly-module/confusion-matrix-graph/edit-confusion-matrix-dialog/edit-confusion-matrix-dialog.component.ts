import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../../core/util/log.service';

@Component({
  selector: 'app-edit-confusion-matrix-dialog',
  templateUrl: './edit-confusion-matrix-dialog.component.html',
  styleUrls: ['./edit-confusion-matrix-dialog.component.scss']
})
export class EditConfusionMatrixDialogComponent implements OnInit {
  objectKeys: string[] = [];
  typeMap: Map<string, string> = new Map<string, string>();
  // tslint:disable-next-line:no-any
  objectMap: any = {};
  classes: string;

  constructor(
    // tslint:disable-next-line:no-any
    @Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<EditConfusionMatrixDialogComponent>, private logService: LogService) {
  }

  ngOnInit(): void {
    this.objectKeys = Object.keys(this.data).filter(x => x !== 'type');
    if (this.data?.x) {
      this.classes = this.stringListToString(this.data.x);
    }
    this.objectKeys.forEach(x => {
      const type = typeof this.data[x];
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
    const labels = this.newLineStringToList(this.classes, this.data.y.length);
    if (labels.length === this.data.x.length) {
      // heatmap renders the labels from bottom to up so reverse them to get correct ordering for confusion matrix
      this.data.y = [...labels].reverse();
      this.data.x = [...labels];
      this.dialogRef.close(this.data);
    }else{
      this.logService.snackBarMessage(`Number of classes should be ${this.data.y.length}`, 2000);
    }
  }

  // tslint:disable-next-line:no-any
  isArrayOfStrings(value: any): boolean {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  }

}

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Tagger} from '../../types/tasks/Tagger';

@Component({
  selector: 'app-confusion-matrix-roc-graph-dialog',
  templateUrl: './confusion-matrix-roc-graph-dialog.component.html',
  styleUrls: ['./confusion-matrix-roc-graph-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfusionMatrixRocGraphDialogComponent implements OnInit {
  element: { confusion_matrix: string | number[][] } | undefined;
  isLoading = true;
  isMultiClass = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { confusion_matrix: string | number[][] }, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.element = this.data;
      this.isMultiClass = typeof this.data.confusion_matrix === 'string' ? JSON.parse(this.data.confusion_matrix)[0].length > 2 : this.data.confusion_matrix[0].length > 2;
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 350);
  }

}

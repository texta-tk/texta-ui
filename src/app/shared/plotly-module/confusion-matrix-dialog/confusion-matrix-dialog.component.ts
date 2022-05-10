import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Tagger} from '../../types/tasks/Tagger';

@Component({
  selector: 'app-confusion-matrix-roc-graph-dialog',
  templateUrl: './confusion-matrix-dialog.component.html',
  styleUrls: ['./confusion-matrix-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfusionMatrixDialogComponent implements OnInit {
  element: { confusion_matrix: string | number[][] } | undefined;
  isLoading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { confusion_matrix: string | number[][] }, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.element = this.data;
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 350);
  }

}

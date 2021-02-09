import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSliderChange} from '@angular/material/slider';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
  selector: 'app-tagger-fine-tune-slider',
  templateUrl: './tagger-fine-tune-slider.component.html',
  styleUrls: ['./tagger-fine-tune-slider.component.scss']
})
export class TaggerFineTuneSliderComponent implements OnInit, OnDestroy {
  @Input() data: { precision: number; recall: number, f1_score: number, confusion_matrix: string };
  matrix: number[][];
  precision: number;
  recall: number;
  // tslint:disable-next-line:variable-name
  f1_score: number;
  sliderChange$: Subject<MatSliderChange> = new Subject<MatSliderChange>();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  sliderVal = 0;

  constructor() {
  }

  formatLabel(value: number): string {
    return value + '%';
  }

  ngOnInit(): void {
    if (this.data) {
      this.matrix = JSON.parse(this.data.confusion_matrix);
      this.precision = this.data.precision || 0;
      this.f1_score = this.data.f1_score || 0;
      this.recall = this.data.recall || 0;
      const nNeg = this.matrix[1][0] + this.matrix[1][1];
      const nPos = this.matrix[0][0] + this.matrix[0][1];
      this.sliderVal = (nPos / (nNeg + nPos)) * 100;
      this.sliderChange$.pipe(debounceTime(2)).subscribe($event => {
        this.doCalculations($event);
      });
    }
  }

  doCalculations($event: MatSliderChange): void {
    if ($event.value) {
      const tp = this.matrix[0][0];
      const fn = this.matrix[0][1];
      const fp = this.matrix[1][0];
      const tn = this.matrix[1][1];
      const nNeg = fp + tn;
      const nPos = tp + fn;
      const tpr = tp / nPos;
      const fpr = fp / nNeg;
      const fnr = fn / nPos;
      const sliderPos = $event.value;
      const sliderNeg = 100 - sliderPos;
      const tps = tpr * sliderPos;
      const fps = fpr * sliderNeg;
      const fns = fnr * sliderPos;
      this.precision = tps / (tps + fps);
      this.recall = tps / (tps + fns);
      this.f1_score = 2 * (this.precision * this.recall) / (this.precision + this.recall);
    }
  }

  sliderChange($event: MatSliderChange): void {
    if (this.matrix.length > 0 && $event.value) {
      this.sliderChange$.next($event);
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

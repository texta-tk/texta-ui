import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter,
  HostListener,
  Input,
  OnChanges, OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import {AccessorType} from '../../../../types/svg/types';
import {Area, CurveFactory, line, Line} from 'd3';
import {Subject} from 'rxjs';
import {auditTime, takeUntil} from 'rxjs/operators';

@Component({
  selector: '[appLine]',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css'],
})
export class LineComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy {
  @Input() type: 'area' | 'line' = 'line';
  @Input() data: any[];
  @Input() xAccessor: AccessorType;
  @Input() yAccessor: AccessorType;
  @Input() y0Accessor?: AccessorType;
  @Input() interpolation?: CurveFactory = d3.curveMonotoneX;
  @Input() fill?: string;
  @ViewChild('linePath', {static: true}) myDivElementRef: ElementRef;
  @Output() hoveredOverData = new EventEmitter<any>();
  lineString: string;
  linePointCoordinates: number[] = [];
  rectWidth = 0;
  rectHeight = 0;
  dataProperties = new WeakMap();
  mouseOverGraph = new Subject<any>();
  destroy$: Subject<boolean> = new Subject();
  svgPoint: SVGPoint = undefined;
  graphOffset = 0;
  previousDotHoveredOver: { radius: number, tooltip: boolean } = undefined;
  mouseOverTimeout: 5 | 20 | 50 = 5;

  @HostListener('window:resize') windowResize() {
    setTimeout(() => {
      this.recalculateGraphBounds();
    });
    if (this.data) {
      this.linePointCoordinates = [];
      this.dataProperties = new WeakMap();
      for (const element of this.data) {
        this.dataProperties.set(element, {radius: 2});
        this.linePointCoordinates.push(this.xAccessor(element));
      }
    }
  }

  updateLineString(): void {
    const lineGenerator = d3[this.type]()
      .defined(d => !isNaN(this.yAccessor(d)))
      .x(this.xAccessor)
      .y(this.yAccessor)
      .curve(this.interpolation);
    if (this.type === 'area') {
      (lineGenerator as Area<[number, number]>)
        .y0(this.y0Accessor)
        .y1(this.yAccessor);
    }

    this.lineString = lineGenerator(this.data);
  }

  highlightNearestElement(evt) {
    // binary search todo
    this.svgPoint.y = evt.offsetY;
    this.svgPoint.x = evt.offsetX - this.graphOffset;
    const closest = this.binarySearch(this.data, this.svgPoint.x);
    if (!this.previousDotHoveredOver) {
      this.previousDotHoveredOver = {radius: 5, tooltip: true};
      this.dataProperties.set(closest, this.previousDotHoveredOver);
      this.hoveredOverData.emit(closest);
    } else {
      this.previousDotHoveredOver.radius = 2;
      this.previousDotHoveredOver.tooltip = false;
      this.previousDotHoveredOver = {radius: 5, tooltip: true};
      this.dataProperties.set(closest, this.previousDotHoveredOver);
      this.hoveredOverData.emit(closest);
    }
  }

  binarySearch(arr, target, lo = 0, hi = arr.length - 1) {
    if (target < this.xAccessor(arr[lo])) {
      return arr[0];
    }
    if (target > this.xAccessor(arr[hi])) {
      return arr[hi];
    }

    const mid = Math.floor((hi + lo) / 2);

    return hi - lo < 2
      ? (target - this.xAccessor(arr[lo])) < (this.xAccessor(arr[hi]) - target) ? arr[lo] : arr[hi]
      : target < this.xAccessor(arr[mid])
        ? this.binarySearch(arr, target, lo, mid)
        : target > this.xAccessor(arr[mid])
          ? this.binarySearch(arr, target, mid, hi)
          : arr[mid];
  }

  recalculateGraphBounds() {
    this.rectWidth = this.myDivElementRef.nativeElement.getBBox().width;
    this.rectHeight = this.myDivElementRef.nativeElement.getBBox().height + 30; // margin top
    this.graphOffset = this.myDivElementRef.nativeElement.nearestViewportElement.width.baseVal.value - this.myDivElementRef.nativeElement.getBBox().width;
    this.graphOffset -= 30; // margin right;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.linePointCoordinates = [];
      this.dataProperties = new WeakMap();
      for (const element of changes.data.currentValue) {
        this.dataProperties.set(element, {radius: 2});
        this.linePointCoordinates.push(this.xAccessor(element));
      }
      this.data.sort((a, b) => this.xAccessor(a) - this.xAccessor(b));
      if (this.data.length > 300) {
        this.mouseOverTimeout = 20;
      } else if (this.data.length > 1000) {
        this.mouseOverTimeout = 50;
      } else {
        this.mouseOverTimeout = 5;
      }

    }
    this.updateLineString();
  }

  ngOnInit() {
    this.mouseOverGraph.pipe(takeUntil(this.destroy$), auditTime(this.mouseOverTimeout)).subscribe(val => {
      if (val) {
        this.highlightNearestElement(val);
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.myDivElementRef) {
        this.svgPoint = this.myDivElementRef.nativeElement.nearestViewportElement.createSVGPoint();
        this.recalculateGraphBounds();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

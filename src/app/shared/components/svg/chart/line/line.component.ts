import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import {AccessorType} from '../../../../types/svg/types';
import {Area, CurveFactory, line, Line} from "d3";

@Component({
  selector: '[appLine]',
  template: `
    <svg:g class="test" (mousemove)="test3($event)" style="pointer-events: all;">
      <svg:rect [attr.x]="0" [attr.y]="0"
                style="visibility: hidden;"
                [attr.width]="rectWidth"
                [attr.height]="rectHeight">

      </svg:rect>
      <svg:path #linePath
                [ngClass]="type"
                [attr.d]="lineString"
                [style.fill]="fill"
      >
      </svg:path>
      <ng-container *ngFor="let element of data">
        <svg:circle
          [attr.r]="dataProperties.get(element).radius"
          [style.fill]="fill"
          [attr.cy]="this.yAccessor(element)"
          [attr.cx]="this.xAccessor(element)"
        >
        </svg:circle>
      </ng-container>
    </svg:g>
    <!--    <ng-container *ngFor="let circle of lineBubbles">
          <svg:circle
            class="line"
            [attr.d]="lineBubbles"
            [attr.r]="3"
            [attr.fill]="red"
            [attr.stroke]="none"
          >
          </svg:circle>
        </ng-container>-->
  `,
  styleUrls: ['./line.component.css']
})
export class LineComponent implements OnChanges, AfterViewInit {
  @Input() type: 'area' | 'line' = 'line';
  @Input() data: any[];
  @Input() xAccessor: AccessorType;
  @Input() yAccessor: AccessorType;
  @Input() y0Accessor?: AccessorType;
  @Input() interpolation?: CurveFactory = d3.curveMonotoneX;
  @Input() fill?: string;
  @ViewChild('linePath', {static: true}) myDivElementRef: ElementRef;
  lineString: string;
  linePointCoordinates: number[] = [];
  rectWidth = 0;
  rectHeight = 0;
  dataProperties = new WeakMap();

  @HostListener('window:resize') windowResize() {
    setTimeout(() => {
      this.rectWidth = this.myDivElementRef.nativeElement.getBBox().width;
      this.rectHeight = this.myDivElementRef.nativeElement.getBBox().height;
    });
    if (this.data) {
      this.linePointCoordinates = [];
      this.dataProperties = new WeakMap();
      for (const element of this.data) {
        this.dataProperties.set(element, {radius: 1});
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

  test3(evt) {
    // binary search todo
    const pt = this.myDivElementRef.nativeElement.nearestViewportElement.createSVGPoint();
    pt.x = evt.offsetX;
    pt.y = evt.offsetY;
    const d = this.myDivElementRef.nativeElement.nearestViewportElement.width.baseVal.value - this.myDivElementRef.nativeElement.getBBox().width;
    pt.x = pt.x - d + 30; // + marginright of timelinecomponent
    const closest = this.closest(pt.x, this.linePointCoordinates);

    console.log(pt);
    for (const element of this.data) {
      if (this.xAccessor(element) === closest) {
        this.dataProperties.set(element, {radius: 5});
      } else {
        this.dataProperties.set(element, {radius: 1});
      }
    }
  }

  closest(num, arr) {
    let curr = arr[0];
    let diff = Math.abs(num - curr);
    for (let val = 0; val < arr.length; val++) {
      const newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        curr = arr[val];
      }
    }
    return curr;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) {
      this.linePointCoordinates = [];
      this.dataProperties = new WeakMap();
      for (const element of changes.data.currentValue) {
        this.dataProperties.set(element, {radius: 1});
        this.linePointCoordinates.push(this.xAccessor(element));
      }
    }
    this.updateLineString();
  }


  ngAfterViewInit() {
    setTimeout(() => {
      this.rectWidth = this.myDivElementRef.nativeElement.getBBox().width;
      this.rectHeight = this.myDivElementRef.nativeElement.getBBox().height;
    });
  }
}

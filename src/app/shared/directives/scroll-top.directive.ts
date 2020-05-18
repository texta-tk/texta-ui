import {AfterViewInit, Directive, ElementRef, Input, OnDestroy} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';

@Directive({
  selector: '[appScrollTop]'
})
export class ScrollTopDirective<T> implements OnDestroy, AfterViewInit {

  @Input('appScrollTop') tableDataSource: MatTableDataSource<T>;

  private destroy$: Subject<boolean> = new Subject();

  constructor(private elRef: ElementRef) {

  }

  ngAfterViewInit(): void {
    if (this.tableDataSource) {
      this.tableDataSource.connect().pipe(takeUntil(this.destroy$)).subscribe(x => {
        if (this.elRef.nativeElement) {
          this.elRef.nativeElement.scrollTop = 0;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

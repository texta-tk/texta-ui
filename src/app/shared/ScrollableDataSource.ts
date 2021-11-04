import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {ResultsWrapper} from './types/Generic';
import {HttpErrorResponse} from '@angular/common/http';
import {debounceTime} from 'rxjs/operators';

// tslint:disable:variable-name
export class ScrollableDataSource<T> extends DataSource<T> {
  private _length = 0;
  get length(): number {
    return this._length;
  }

  private _pageSize = 20;
  private _cachedData: T[] = Array.from<T>({length: this._length});
  private _fetchedPages = new Set<number>();
  private readonly _dataStream = new BehaviorSubject<T[]>(this._cachedData);
  private readonly _subscription = new Subscription();
  private collectionViewer: CollectionViewer;
  private filterParam = '';

  // tslint:disable-next-line:no-any
  constructor(private fetchFn: (pageNr: number, pageSize: number, filterParam: string,
                                // tslint:disable-next-line:no-any
                                context: any) => Observable<ResultsWrapper<T> | HttpErrorResponse>,
              // tslint:disable-next-line:no-any
              private context: any) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<T[]> {
    this.fetchFirstPage();
    this.collectionViewer = collectionViewer;
    return this._dataStream;
  }

  collectionViewerSub(): void {
    this._subscription.add(this.collectionViewer.viewChange.pipe(debounceTime(450)).subscribe(range => {
      const startPage = this._getPageForIndex(range.start);
      const endPage = this._getPageForIndex(range.end - 1);
      for (let i = startPage; i <= endPage; i++) {
        this._fetchPage(i);
      }
    }));
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  public filter(filterParam: string): void {
    this.filterParam = filterParam;
    this._fetchedPages = new Set();
    this.fetchFirstPage();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  public fetchFirstPage(): void {
    this._fetchedPages.add(0);
    const pageS = this._pageSize;
    this.fetchFn(0, pageS, this.filterParam, this.context).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this._length = resp.count;
        this._cachedData = Array.from<T>({length: this._length});
        this._cachedData.splice(0, pageS, ...resp.results);
        this._dataStream.next(this._cachedData);
        this.collectionViewerSub();
      }
    });
  }

  private _fetchPage(page: number): void {
    if (this._fetchedPages.has(page)) {
      return;
    }
    this._fetchedPages.add(page);

    // Use `setTimeout` to simulate fetching data from server.
    this.fetchFn(page, this._pageSize, this.filterParam, this.context).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this._cachedData.splice(page * this._pageSize, this._pageSize, ...resp.results);
        this._dataStream.next(this._cachedData);
      }
    });
  }
}

import {Injectable} from '@angular/core';
import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

export class SearchService {
  private searchSubject = new BehaviorSubject<Search>(null);
  // todo, what to do when we change project?
  constructor() {
  }

  public nextSearch(search: Search) {
    this.searchSubject.next(search);
  }

  public getSearch(): Observable<Search> {
    return this.searchSubject.asObservable();
  }
}

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {LogService} from '../util/log.service';
import {environment} from '../../../environments/environment';
import {LocalStorageService} from '../util/local-storage.service';
import {Observable, of, Subject} from 'rxjs';
import {TextConstraint} from '../../searcher/searcher-sidebar/build-search/Constraints';
import {Field} from '../../shared/types/Project';

@Injectable({
  providedIn: 'root'
})
export class SearcherService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private localStorageService: LocalStorageService,
              private logService: LogService) {
  }

  getSavedSearchById(id: number, projectId: number) {
    return new TextConstraint([{path: 'body', type: 'body'} as Field], 'phrase', 'tere \nkere', 'must');
  }

}

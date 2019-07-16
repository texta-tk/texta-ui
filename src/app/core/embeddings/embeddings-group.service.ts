import { Injectable } from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingsGroupService {
  apiUrl = environment.apiUrl;

  constructor() { }
}

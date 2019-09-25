import {Component, OnInit} from '@angular/core';
import {SearchService} from './services/search.service';

@Component({
  selector: 'app-searcher',
  templateUrl: './searcher.component.html',
  styleUrls: ['./searcher.component.scss'],
  providers: [SearchService]
})
export class SearcherComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {PORTAL_DATA} from '../PortalToken';

@Component({
  selector: 'app-graph-selected-portal',
  templateUrl: './graph-selected-portal.component.html',
  styleUrls: ['./graph-selected-portal.component.scss']
})
export class GraphSelectedPortalComponent implements OnInit {

  total = 0;
  constructor(@Inject(PORTAL_DATA) public data: {total: number}) {
    this.total = data.total;
  }

  ngOnInit(): void {
  }

}

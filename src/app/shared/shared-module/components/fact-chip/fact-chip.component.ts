import {Component, Input, OnInit} from '@angular/core';
import {HighlightSpan} from '../../../../searcher/searcher-table/highlight/highlight.component';

@Component({
  selector: 'app-fact-chip',
  templateUrl: './fact-chip.component.html',
  styleUrls: ['./fact-chip.component.scss']
})
export class FactChipComponent implements OnInit {
  @Input() backGroundColor: string;
  @Input() textColor: string;
  @Input() displayValue: string;
  @Input() hoverValue: string;
  constructor() {
  }

  ngOnInit(): void {
  }

}

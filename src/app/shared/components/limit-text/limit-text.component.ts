import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-limit-text',
  templateUrl: './limit-text.component.html',
  styleUrls: ['./limit-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitTextComponent implements OnInit {
  cutText;
  fullText;

  constructor() {
  }

  @Input() set params(params: { text: string | number, charLimit: number }) {
    if (params.text) {
      if (typeof params.text === 'number') {
        params.text = params.text.toString();
      }
      this.fullText = params.text;
      if (params.text.length > params.charLimit) {
        this.cutText = params.text.slice(0, params.charLimit);
      } else {
        this.cutText = this.fullText;
      }
    } else {
      this.fullText = '';
      this.cutText = this.fullText;
    }
  }

  ngOnInit(): void {

  }

  showAllText() {
    this.cutText = this.fullText;
  }
}

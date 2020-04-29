import {ChangeDetectionStrategy, Component, Inject, Input, OnInit, PLATFORM_ID, Renderer2} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

@Component({
  selector: 'app-limit-text',
  templateUrl: './limit-text.component.html',
  styleUrls: ['./limit-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitTextComponent implements OnInit {
  displayText;
  cutText;
  fullText;

  constructor(@Inject(PLATFORM_ID) private platformId: any,) {
  }

  @Input() set params(params: { text: string | number, charLimit: number }) {
    if (params.text) {
      if (typeof params.text === 'number') {
        params.text = params.text.toString();
      }
      this.fullText = params.text;
      if (params.text.length > params.charLimit) {
        this.displayText = params.text.slice(0, params.charLimit);
        this.cutText = this.displayText;
      } else {
        this.displayText = this.fullText;
      }
    } else {
      this.fullText = '';
      this.displayText = this.fullText;
    }
  }

  ngOnInit(): void {

  }

  showAllText() {
    if (isPlatformBrowser(this.platformId)) {
      if (window.getSelection()?.type !== 'Range') {
        if (this.displayText === this.fullText && this.cutText) {
          this.displayText = this.cutText;
        } else if (this.displayText === this.cutText && this.fullText) {
          this.displayText = this.fullText;
        }
      }
    }
  }
}

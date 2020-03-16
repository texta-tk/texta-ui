import {Component, Input} from '@angular/core';
import {HighlightComponent, HighlightSpan} from '../highlight/highlight.component';

interface ContextSpan {
  text: string;
  highlighted: boolean;
  type: 'highlight' | 'context' | 'text';
  highlightSpan?: HighlightSpan;
  color?: string;
  hidden?: boolean;
  displayText?: string;
}

@Component({
  selector: 'app-short-version',
  templateUrl: './short-version.component.html',
  styleUrls: ['./short-version.component.scss']
})
export class ShortVersionComponent {
  highlightArray: ContextSpan[] = [];

  @Input() set params(params: { data: any, currentColumn: string, searcherHighlight: any, contextWindow: number }) {
    if (params?.data && params?.searcherHighlight && params.currentColumn && params.data[params.currentColumn] !== '' &&
      params.data[params.currentColumn] && params?.contextWindow > 0) {
      const f = new HighlightComponent();
      const highlightTerms = [
        ...f.makeSearcherHighlights(params.searcherHighlight, params.currentColumn),
      ];
      const colors = f.generateColorsForFacts(highlightTerms);
      this.highlightArray = this.makeShortVersionSpans(params.data[params.currentColumn].toString(),
        highlightTerms, colors, params.contextWindow);
    } else {
      this.highlightArray = [];
    }
  }

  constructor() {
  }

  private makeShortVersionSpans(originalText: string, facts: HighlightSpan[], factColors: Map<string, string>,
                                wordContextDistance: number): ContextSpan[] {
    if (facts.length === 0) {
      return [{text: originalText, highlighted: false, type: 'context'}];
    }
    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });

    facts.sort(this.sortByStartLowestSpan);
    const highlightArray: ContextSpan[] = [];
    let index = 0;
    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i];
      const factStart = fact.spans[0] as number;
      const factEnd = fact.spans[1] as number;
      const spanBeforeText = originalText.slice(index, factStart);
      const beforeHighlightContext = this.getHighlightContext(spanBeforeText, wordContextDistance, 'end');
      if (beforeHighlightContext.text.length !== spanBeforeText.length) { // if it has any hidden text, push that in
        highlightArray.push({
          text: originalText.slice(index, factStart - beforeHighlightContext.text.length),
          highlighted: false,
          type: 'text',
          displayText: ' ... ',
          hidden: true
        });
      }
      highlightArray.push(beforeHighlightContext); // then push the highlight context
      highlightArray.push({ // push in the actual highlight
        text: originalText.slice(factStart, factEnd),
        highlighted: true,
        highlightSpan: fact,
        color: factColors.get(fact.fact),
        type: 'highlight'
      });
      let spanAfterText;
      if (facts.length > i + 1) {
        spanAfterText = originalText.slice(factEnd, facts[i + 1].spans[0] as number);
      } else {
        spanAfterText = originalText.slice(factEnd, originalText.length);
      }
      if (spanAfterText) { // if there still is text left over push the context after the highlight
        const afterHighlightContext = this.getHighlightContext(spanAfterText, wordContextDistance, 'start');
        highlightArray.push(afterHighlightContext);
        index = factEnd + afterHighlightContext.text.length;
      } else {
        index = factEnd;
      }
    }
    if (index !== originalText.length) {
      highlightArray.push({
        text: originalText.slice(index, originalText.length),
        highlighted: false,
        type: 'text',
        displayText: ' ... ',
        hidden: true
      });
    }
    return highlightArray;
  }

  // (from) parameter marks where to split the context from: for example with "start"
  // sample text: "bla bla bla bla bla" output: "{highlight} bla bla bla ..."
  // for example with "end"
  // sample text: "bla bla bla bla bla" output: "... bla bla bla {highlight}"
  // @ts-ignore
  private getHighlightContext(context: string, contextWordLimit: number, from: 'start' | 'end'): ContextSpan {
    const split = context.trim().split(' ');
    if (split.length <= contextWordLimit) { // nothing to hide
      return {
        text: context,
        highlighted: false,
        type: 'context'
      };
    }
    if (from === 'start') {
      const contextText = split.slice(0, contextWordLimit).join(' ');
      return {
        text: ' ' + contextText,
        highlighted: false,
        type: 'context'
      };
    }
    if (from === 'end') {
      const contextText = split.slice(split.length - contextWordLimit, split.length).join(' ');
      return {
        text: contextText + ' ',
        highlighted: false,
        type: 'context'
      };
    }
  }

  private sortByStartLowestSpan(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

  public toggleSpanText(span: ContextSpan) {
    if (span.hidden) {
      span.displayText = span.text;
    } else {
      span.displayText = ' ... ';
    }
    span.hidden = !span.hidden;
  }

}

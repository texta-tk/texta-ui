import {Component, Input} from '@angular/core';
import {HighlightComponent, HighlightSpan} from '../highlight/highlight.component';

interface ShortVersionSpan {
  text: string;
  highlighted: boolean;
  textContext?: string;
  before?: boolean;
  after?: boolean;
  color?: string;
}

@Component({
  selector: 'app-short-version',
  templateUrl: './short-version.component.html',
  styleUrls: ['./short-version.component.scss']
})
export class ShortVersionComponent {
  highlightArray: ShortVersionSpan[] = [];

  @Input() set params(params: { data: any, currentColumn: string, searcherHighlight: any }) {
    if (params?.data && params?.searcherHighlight && params.currentColumn && params.data[params.currentColumn] !== '' && params.data[params.currentColumn]) {
      const f = new HighlightComponent();
      const highlightTerms = [
        ...f.makeSearcherHighlights(params.searcherHighlight, params.currentColumn),
      ];
      const colors = f.generateColorsForFacts(highlightTerms);
      this.highlightArray = this.makeShortVersionSpans(params.data[params.currentColumn], highlightTerms, colors, 7);
    } else {
      this.highlightArray = [];
    }
  }

  constructor() {
  }

  private makeShortVersionSpans(originalText: string | number, facts: HighlightSpan[], factColors: Map<string, string>,
                                wordContextDistance: number): ShortVersionSpan[] {
    // column content can be number, convert to string
    originalText = originalText.toString();
    if (facts.length === 0) {
      return [{text: originalText, highlighted: false}];
    }
    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });

    facts.sort(this.sortByStartLowestSpan);
    const highlightArray: ShortVersionSpan[] = [];
    let spanText = '';
    let lowestSpanNumber: number | null = facts[0].spans[0] as number;
    for (let i = 0; i <= originalText.length; i++) {
      let fact: HighlightSpan | undefined;
      // get next span position when needed
      if (lowestSpanNumber !== null && i >= lowestSpanNumber) {
        fact = this.getFactByStartSpan(i, facts);
        lowestSpanNumber = this.getFactWithStartSpanHigherThan(i, facts);
      }

      if (fact !== undefined && fact.spans[0] !== fact.spans[1]) {

        // push old non fact text into array
        highlightArray.push({
          text: spanText,
          highlighted: false,
          before: highlightArray.length === 0,
          after: highlightArray.length >= 1,
          textContext: this.getContext(spanText, wordContextDistance)
        });
        spanText = '';
        // make a regular fact, highlightarray updated inside function, return new loop index
        i = this.makeHighlight(highlightArray, fact, i, originalText, factColors);

      } else {
        if (!lowestSpanNumber) {
          spanText += originalText.slice(i, originalText.length);
          i = originalText.length;
        } else {
          spanText += originalText.slice(i, lowestSpanNumber);
          i = lowestSpanNumber - 1;
        }
      }
    }

    if (spanText !== '') {
      // if the last substring in the whole string wasnt a fact
      // that means there was no way for it to be added into the highlightarray,
      // push non fact text into array
      highlightArray.push({text: spanText, highlighted: false, after: true, textContext: this.getContext(spanText, wordContextDistance)});
    }

    return highlightArray;
  }

  private makeHighlight(highlight: ShortVersionSpan[], fact: HighlightSpan, loopIndex: number, originalText: string,
                        colors: Map<string, string>)
    : number {
    let newText = '';
    const factFinalSpanIndex = fact.spans[1] as number;
    newText += originalText.slice(loopIndex, factFinalSpanIndex);
    loopIndex = factFinalSpanIndex;
    highlight.push({text: newText, highlighted: true, color: colors.get(fact.fact)});
    // - 1 because loop is escaped
    return loopIndex - 1;
  }

  private getContext(text: string, wordLimit: number) {
    const split = text.split(' ');
    if (split.length <= wordLimit) {
      return text;
    } else {
      return split.slice(0, wordLimit).join(' ');
    }
  }

  private getFactByStartSpan(loopIndex: number, facts: HighlightSpan[]): HighlightSpan | undefined {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] === loopIndex) {
        return fact;
      }
    }
    return undefined;
  }

  private getFactWithStartSpanHigherThan(position: number, facts: HighlightSpan[]): number | null {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] > position) {
        return fact.spans[0] as number;
      }
    }
    return null;
  }

  private sortByStartLowestSpan(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

}

import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import * as LinkifyIt from 'linkify-it';
import {LegibleColor, UtilityFunctions} from '../../UtilityFunctions';
import {HighlightSettings} from '../../SettingVars';
import {HighlightComponent} from "../../../searcher/searcher-table/highlight/highlight.component";

// tslint:disable:no-any
export interface HighlightSpan {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
  id?: number;
  urlSpan?: boolean;
  sent_index?: number;
  searcherHighlight?: boolean;
}

interface HighlightConfig<T extends HighlightSpan> {
  currentColumn: string;
  searcherHighlight: any;
  highlightTextaFacts: boolean;
  highlightHyperlinks: boolean;
  charLimit?: number;
  titleAccessor: (x: T) => string;
  colors?: Map<string, LegibleColor>;
  data: any;
}

interface HighlightObject<T extends HighlightSpan> {
  text: string;
  highlighted: boolean;
  span?: T;
  color?: LegibleColor;
  nested?: HighlightObject<T>;
}

@Component({
  selector: 'app-generic-highlighter',
  templateUrl: './generic-highlighter.component.html',
  styleUrls: ['./generic-highlighter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericHighlighterComponent<T extends HighlightSpan> {
  static linkify = new LinkifyIt();
  highlightArray: HighlightObject<T>[] = [];
  isTextLimited: boolean;

  constructor() {
  }

  // tslint:disable:variable-name
  _highlightConfig: HighlightConfig<T>;

  // tslint:disable:no-any

  @Input() set highlightConfig(highlightConfig: HighlightConfig<T>) {
    this._highlightConfig = highlightConfig;
    if (highlightConfig.titleAccessor) {
      this.titleAccessor = highlightConfig.titleAccessor;
    }
    if (highlightConfig.charLimit && highlightConfig.charLimit !== 0 &&
      highlightConfig.data[highlightConfig.currentColumn] !== null && highlightConfig.data[highlightConfig.currentColumn] !== undefined
      && (isNaN(Number(highlightConfig.data[highlightConfig.currentColumn])))) {

      // slice original text for charlimit bounds, deep clone
      const edited: any = (({data, ...o}) => o)(highlightConfig);
      edited.data = Object.assign({}, highlightConfig.data);
      if (edited.data[edited.currentColumn].length > edited.charLimit) {
        this.isTextLimited = true;
      }
      edited.data[edited.currentColumn] = edited.data[edited.currentColumn].slice(0, edited.charLimit);
      this.makeHighlightArray(edited);
    } else {
      this.makeHighlightArray(highlightConfig);
    }
  }

  static generateColorsForFacts(facts: { fact: string }[]): Map<string, LegibleColor> {
    facts.forEach(fact => {
      if (!UtilityFunctions.colors.has(fact.fact)) {
        UtilityFunctions.colors.set(fact.fact, {
          // tslint:disable-next-line:no-bitwise
          backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
          textColor: 'black'
        });
      }
    });
    return UtilityFunctions.colors;
  }

  static isFactIndexEqual(fact1: HighlightSpan, fact2: HighlightSpan): boolean {
    const fact1SentIndex = fact1.sent_index !== undefined ? fact1.sent_index : 0;
    const fact2SentIndex = fact2.sent_index !== undefined ? fact2.sent_index : 0;
    return fact1SentIndex === fact2SentIndex;
  }

  // convert searcher highlight into mlp fact format
  makeSearcherHighlights(searcherHighlight: any, currentColumn: string, isSentenceSplit: boolean): T[] {
    const highlight = searcherHighlight ? searcherHighlight[currentColumn] : null;
    if (highlight && highlight.length === 1) { // elasticsearch returns as array
      let sentenceSplit = [];
      const highlightArray: T[] = [];
      if (isSentenceSplit) {
        sentenceSplit = highlight[0].split(' \n ');
      } else {
        sentenceSplit[0] = highlight[0];
      }
      for (let sentenceIndex = 0; sentenceIndex <= sentenceSplit.length - 1; sentenceIndex++) {
        const columnText = sentenceSplit[sentenceIndex];
        const splitStartTag: string[] = columnText.split(HighlightSettings.PRE_TAG);
        let previousIndex = 0; // char start index of highlight
        for (const row of splitStartTag) {
          const endTagIndex = row.indexOf(HighlightSettings.POST_TAG);
          if (endTagIndex > 0) {
            const f: T = {} as T;
            f.doc_path = currentColumn;
            f.fact = '';
            f.sent_index = sentenceIndex;
            f.searcherHighlight = true;
            f.spans = `[[${previousIndex}, ${previousIndex + endTagIndex}]]`;
            f.str_val = 'searcher highlight';
            highlightArray.push(f);
            const rowClean = row.replace(HighlightSettings.POST_TAG, '');
            previousIndex = previousIndex + rowClean.length;
          } else {
            previousIndex = previousIndex + row.length;
          }
        }
      }
      return highlightArray;
    }
    return [];
  }

  titleAccessor = (x: T) => '';

  public toggleTextLimit(): void {
    if (window.getSelection()?.type !== 'Range') {
      const edited: any = (({data, ...o}) => o)(this._highlightConfig);
      edited.data = Object.assign({}, this._highlightConfig.data);
      if (edited.charLimit !== 0 && edited && !this.isTextLimited) {
        edited.data[edited.currentColumn] = edited.data[edited.currentColumn].slice(0, edited.charLimit);
      }
      this.makeHighlightArray(edited);
      this.isTextLimited = !this.isTextLimited;
    }
  }

  makeHighlightArray(highlightConfig: HighlightConfig<T>): void {
    if (highlightConfig.data[highlightConfig.currentColumn] !== null && highlightConfig.data[highlightConfig.currentColumn] !== undefined) {
      let fieldFacts: T[] = [];
      let hyperLinks: T[] = [];
      if (highlightConfig.highlightTextaFacts) {
        fieldFacts = this.constructFactArray(highlightConfig);
      }
      // elastic fields arent trimmed by default, so elasticsearch highlights are going to be misaligned because
      // elasticsearch highlighter trims the field, MLP also trims the field
      // trim it here cause we need to get hyperlinks with trimmed columndata so it wouldnt be misaligned
      if ((isNaN(Number(highlightConfig.data[highlightConfig.currentColumn])))) {
        highlightConfig.data[highlightConfig.currentColumn] = highlightConfig.data[highlightConfig.currentColumn].trim();
      }

      const isSentenceSplit = fieldFacts.some(x => x.sent_index && x.sent_index > 0);

      if (highlightConfig.highlightHyperlinks) {
        hyperLinks = this.makeHyperlinksClickable(highlightConfig.data[highlightConfig.currentColumn], highlightConfig.currentColumn, isSentenceSplit);
      }

      const highlightTerms = [
        ...hyperLinks,
        ...this.makeSearcherHighlights(highlightConfig.searcherHighlight, highlightConfig.currentColumn, isSentenceSplit),
        ...fieldFacts
      ];
      const colors = highlightConfig.colors || GenericHighlighterComponent.generateColorsForFacts(highlightTerms);
      this.highlightArray = this.makeHighLights(highlightConfig.data[highlightConfig.currentColumn], highlightTerms, colors);
    } else {
      this.highlightArray = [];
    }
  }

  constructFactArray(highlightConfig: HighlightConfig<T>): T[] {
    let fieldFacts: T[];
    fieldFacts = this.getFactsByField(highlightConfig.data, highlightConfig.currentColumn);
    fieldFacts = UtilityFunctions.getDistinctByProperty<T>(fieldFacts, (x => x.spans));
    return fieldFacts;
  }

  makeHyperlinksClickable(currentColumn: string | number, colName: string, isSentenceSplit: boolean): T[] {
    // Very quick check, that can give false positives.
    let sentenceSplit = [];
    const highlightArray: T[] = [];
    if (isSentenceSplit) {
      sentenceSplit = (currentColumn as string).split(' \n ');
    } else {
      sentenceSplit[0] = currentColumn;
    }
    for (let sentenceIndex = 0; sentenceIndex <= sentenceSplit.length - 1; sentenceIndex++) {
      const columnText = sentenceSplit[sentenceIndex];
      if (isNaN(Number(currentColumn)) && GenericHighlighterComponent.linkify.pretest(columnText as string)) {
        const matches = GenericHighlighterComponent.linkify.match(columnText as string);
        if (matches && matches.length > 0) {
          for (const match of matches) {
            const f: T = {} as T;
            f.doc_path = colName;
            f.fact = '';
            f.sent_index = sentenceIndex;
            f.urlSpan = true;
            f.spans = `[[${match.index}, ${match.lastIndex}]]`;
            f.str_val = match.url;
            highlightArray.push(f);
          }
        }
        return highlightArray;
      }
    }
    return [];
  }

  // tslint:disable-next-line:no-any
  getFactsByField(factArray: any, columnName: string): T[] {
    factArray = factArray.texta_facts;
    if (factArray) {
      return JSON.parse(JSON.stringify(factArray.filter((fact: T) => {
        if (fact.doc_path === columnName) {
          return fact;
        }
      })));
    }
    return [];
  }

  private makeHighLights(originalText: string | number, facts: T[], factColors: Map<string, LegibleColor>): HighlightObject<T>[] {
    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      if (typeof fact.spans === 'string') {
        (fact.spans) = JSON.parse(fact.spans as string).flat();
      }
    });
    // remove document wide facts and empty facts (facts that have same span start and end index)
    facts = facts.filter(x => x.spans[0] !== x.spans[1]);
    // column content can be number, convert to string
    originalText = originalText.toString();
    if (facts.length === 0) {
      return [{text: originalText, highlighted: false}];
    }
    // need this sort for fact priority
    facts.sort(this.sortByStartLowestSpan);


    const highlightArray: HighlightObject<T>[] = [];
    const overLappingFacts = this.detectOverlappingFacts(facts);
    let factText = '';
    let sentenceSplit = [];
    const isSentenceSplit = facts.some(x => x.sent_index && x.sent_index > 0);
    if (isSentenceSplit) {
      sentenceSplit = originalText.split(' \n ');
    } else {
      sentenceSplit[0] = originalText;
    }
    for (let sentenceIndex = 0; sentenceIndex <= sentenceSplit.length - 1; sentenceIndex++) {
      const sentenceText = sentenceSplit[sentenceIndex];
      const sentenceIndexFacts = isSentenceSplit ? facts.filter(x => x.sent_index === sentenceIndex) : facts;
      let lowestSpanNumber: number | null = sentenceIndexFacts.length > 0 ? sentenceIndexFacts[0]?.spans[0] as number : null;
      for (let i = 0; i <= sentenceText.length; i++) {
        let fact: T | undefined;
        // get next span position when needed
        if (lowestSpanNumber !== null && i >= lowestSpanNumber) {
          fact = this.getFactByStartSpan(i, sentenceIndexFacts);
          lowestSpanNumber = this.getFactWithStartSpanHigherThan(i, sentenceIndexFacts);
        }

        if (fact !== undefined && fact.spans[0] !== fact.spans[1]) {
          if (this.isOverLappingFact(overLappingFacts, fact)) {
            // push old non fact text into array
            highlightArray.push({text: factText, highlighted: false});
            factText = '';
            // highlightarray is updated inside this function, return new loop index (where to resume from)
            i = this.makeFactNested(highlightArray, fact, overLappingFacts, i, sentenceText, factColors);
          } else {
            // push old non fact text into array
            highlightArray.push({text: factText, highlighted: false});
            factText = '';
            // make a regular fact, highlightarray updated inside function, return new loop index
            i = this.makeFact(highlightArray, fact, i, sentenceText, factColors);
          }
        } else {
          if (!lowestSpanNumber) {
            factText += sentenceText.slice(i, sentenceText.length);
            i = sentenceText.length;
          } else {
            factText += sentenceText.slice(i, lowestSpanNumber);
            i = lowestSpanNumber - 1;
          }
        }
      }

      if (factText !== '') {
        // if the last substring in the whole string wasnt a fact
        // that means there was no way for it to be added into the highlightarray,
        // push non fact text into array
        highlightArray.push({text: factText, highlighted: false});
        factText = '';
      }
    }

    return highlightArray;
  }

  private isOverLappingFact(overLappingFacts: Map<T, T[]>, fact: T): boolean {
    for (let i = 0; i < overLappingFacts.size; i++) {
      if (Array.from(overLappingFacts.keys()).includes(fact)) {
        return true;
      }
    }
    return false;
  }

  private makeFactNestedHighlightRecursive(highlightObject: HighlightObject<T>, factToInsert: T | undefined,
                                           color: LegibleColor | undefined, textToInsert: string): HighlightObject<T> {
    if (typeof highlightObject.nested === 'undefined') {
      highlightObject.nested = {
        text: textToInsert,
        highlighted: true,
        span: factToInsert,
        color,
        nested: undefined
      };
    } else {
      this.makeFactNestedHighlightRecursive(highlightObject.nested, factToInsert, color, textToInsert);
    }
    return highlightObject;
  }

  // need to write tests to see if this works, might refactor
  private makeFactNested(
    highlightArray: HighlightObject<T>[],
    rootFact: T,
    overLappingFacts: Map<T, T[]>,
    loopIndex: number,
    originalText: string,
    colors: Map<string, LegibleColor>): number {
    // deep copy
    const nestedFacts: T[] = JSON.parse(JSON.stringify(overLappingFacts.get(rootFact)));
    // highest span value in nestedfacts
    const highestSpanValue = new Map<T, number>();
    for (const factNested of nestedFacts) {
      // @ts-ignore
      highestSpanValue.set(factNested, Math.max.apply(Math, factNested.spans));
    }
    let highlightObject: HighlightObject<T> | undefined;
    let factText = '';
    let previousFact: T | undefined;
    const factsToDelete: T[] = [];
    if (rootFact) {
      for (const factNested of nestedFacts) {
        let factStartSpan = (factNested.spans[0] as number);
        const factEndSpan = (factNested.spans[1] as number);
        const highlightFactEndSpan = (rootFact.spans[1] as number);
        if (factStartSpan <= highlightFactEndSpan && !factNested.searcherHighlight) {
          factStartSpan = highlightFactEndSpan;
          if (factStartSpan >= factEndSpan) {
            const index = nestedFacts.indexOf(factNested, 0);
            if (index > -1) {
              factsToDelete.push(factNested);
            }
          }
          (factNested.spans as number[])[0] = factStartSpan;
        }
      }
      for (const textaFact of factsToDelete) {
        nestedFacts.splice(nestedFacts.indexOf(textaFact, 0), 1);
      }
    }
    nestedFacts.sort(this.sortByStartLowestSpan);

    for (let i = loopIndex; i <= originalText.length; i++) {

      let factCurrentIndex = this.startOfFact(nestedFacts, i, previousFact);

      if (factCurrentIndex) {
        // first fact is rootfact, push the currently parsed text into it,
        // since the end of rootfact is the start of a new fact then we need to use previousFact
        // otherwise the fact would have no text
        if (!highlightObject) {
          highlightObject = {
            text: factText,
            highlighted: true,
            span: rootFact,
            color: colors.get(rootFact.fact),
            nested: undefined
          };
          factText = '';
          previousFact = factCurrentIndex;
        } else {
          highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, previousFact,
            // todo fix in TS 3.7
            // tslint:disable-next-line:no-non-null-assertion
            colors.get(previousFact!.fact),
            factText);
          factText = '';
          previousFact = factCurrentIndex;
        }
      }
      // todo fix confusing variable naming
      if ((previousFact && highestSpanValue.get(previousFact) === i) ||
        (rootFact.spans[1] === i && !(previousFact && nestedFacts.includes(previousFact)))) {
        if (factText !== '') {
          if (!highlightObject) {
            highlightObject = {
              text: factText,
              highlighted: true,
              span: rootFact,
              color: colors.get(rootFact.fact),
              nested: undefined
            };
            factText = '';
            previousFact = factCurrentIndex;
          } else {
            factCurrentIndex = previousFact;
            highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, factCurrentIndex,
              // @ts-ignore
              colors.get(factCurrentIndex.fact),
              factText);
            factText = '';
          }
        }
        // cant loop over rootfact
        if (rootFact.spans[1] <= i) {
          // are there any nested facts that can still go on?
          // @ts-ignore
          if (Math.max.apply(null, nestedFacts.map(x => Math.max.apply(Math, x.spans))) > i) {
            for (const factLeft of nestedFacts) {
              if (factLeft.spans[1] > i) {
                previousFact = factLeft;
                break;
              }
            } // nothing to loop over now
          } else {
            // highlightarray is reference to outer scope, push and return new loop index
            if (highlightObject) {
              highlightArray.push(highlightObject);
            } else {
              console.log('highlightobject undefined, this should never happen');
            }
            // - 1 because loop is escaped
            return i - 1;
          } // rootfact still exists so lets just continue looping with that
        } else {
          previousFact = rootFact;
        }
      }

      factText += originalText.charAt(i);
    }

    return loopIndex;
  }

  // searcher prio
  private startOfFact(nestedFacts: T[], loopIndex: number, previousFact: T | undefined): T | undefined {
    const facts: T[] = nestedFacts.filter(e => (e.spans[0] === loopIndex));
    if (facts.length > 0) {
      if (facts.length > 1) {
        for (const fact of facts) {
          if (fact.searcherHighlight) {
            return fact;
          } else if (previousFact) {
            if (previousFact.searcherHighlight && previousFact.spans[1] > fact.spans[0]) {
              if (fact.spans[1] <= previousFact.spans[1]) {
                nestedFacts.splice(nestedFacts.indexOf(fact, 0), 1);
              } else {
                (fact.spans as number[])[0] = previousFact.spans[1] as number;
              }
            }
          }
        }
        return undefined;
      } else if (previousFact) {
        if (previousFact.searcherHighlight && previousFact.spans[1] > facts[0].spans[0]) {
          if (facts[0].spans[1] <= previousFact.spans[1]) {
            nestedFacts.splice(nestedFacts.indexOf(facts[0], 0), 1);
          } else {
            (facts[0].spans as number[])[0] = previousFact.spans[1] as number;
          }
          return undefined;
        }
      }
      return facts[0];
    }
    return undefined;
  }

  private makeFact(highlight: HighlightObject<T>[], fact: T, loopIndex: number, originalText: string,
                   colors: Map<string, LegibleColor>): number {
    let newText = '';
    const factFinalSpanIndex = fact.spans[1] as number;
    newText += originalText.slice(loopIndex, factFinalSpanIndex);
    loopIndex = factFinalSpanIndex;
    highlight.push({text: newText, highlighted: true, span: fact, color: colors.get(fact.fact)});
    // - 1 because loop is escaped
    return loopIndex - 1;

  }


  private detectOverlappingFacts(facts: T[]): Map<T, T[]> {
    let overLappingFacts: Map<T, T[]> = new Map<T, T[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
      overLappingFacts = this.detectOverLappingFactsDrill(facts[0], facts, facts[0].spans[1] as number, 1, overLappingFacts);
    }

    return overLappingFacts;
  }

  private detectOverLappingFactsDrill(factRoot: T, facts: T[], endSpan: number, index: number,
                                      nestedArray: Map<T, T[]>): Map<T, T[]> {
    // endSpan = previous facts span ending so we can make long chains of nested facts
    if (index < facts.length) {
      if (facts[index].spans[0] < endSpan && HighlightComponent.isFactSentIndexEqual(facts[index], factRoot)) {
        endSpan = facts[index].spans[1] as number > endSpan ? facts[index].spans[1] as number : endSpan;
        // keep iterating with current fact till it finds one who isnt nested into this fact
        // todo fix in TS 3.7
        // tslint:disable-next-line:no-non-null-assertion
        nestedArray.set(factRoot, nestedArray.has(factRoot) ? nestedArray.get(factRoot)!.concat(facts[index]) : [facts[index]]);
        return this.detectOverLappingFactsDrill(factRoot, facts, endSpan, index + 1, nestedArray);
      }
      // this fact isnt nested, set it as new root fact and keep iterating
      // id to avoid identical fact objects
      const newRootFact = facts[index];
      newRootFact.id = index;
      endSpan = newRootFact.spans[1] as number;
      return this.detectOverLappingFactsDrill(newRootFact, facts, endSpan, index + 1, nestedArray);
    }
    return nestedArray;
  }

  private getFactByStartSpan(loopIndex: number, facts: T[]): T | undefined {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] === loopIndex) {
        return fact;
      }
    }
    return undefined;
  }

  private getFactWithStartSpanHigherThan(position: number, facts: T[]): number | null {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] > position) {
        return fact.spans[0] as number;
      }
    }
    return null;
  }

  private sortByStartLowestSpan(a: T, b: T): -1 | 1 {
    if (a.sent_index !== undefined && b.sent_index !== undefined) {
      if (a.sent_index === b.sent_index) {
        if (a.spans[0] === b.spans[0]) {
          return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
        } else {
          return (a.spans[0] < b.spans[0]) ? -1 : 1;
        }
      } else {
        return (a.sent_index < b.sent_index) ? -1 : 1;
      }

    } else if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

}

GenericHighlighterComponent.linkify.set({fuzzyLink: false, fuzzyEmail: false});

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  Renderer2,
  ElementRef, OnDestroy
} from '@angular/core';
import {FactConstraint} from '../../searcher-sidebar/build-search/Constraints';
import * as LinkifyIt from 'linkify-it';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {HighlightSettings} from '../../../shared/SettingVars';
import {environment} from '../../../../environments/environment';
import {AppConfigService} from '../../../core/util/app-config.service';

// tslint:disable:no-any
export interface HighlightSpan {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
  id?: number;
  urlSpan?: boolean;
  searcherHighlight?: boolean;
}

export interface HighlightConfig {
  currentColumn: string;
  searcherHighlight: any;
  onlyHighlightMatching?: FactConstraint[];
  highlightTextaFacts: boolean;
  highlightHyperlinks: boolean;
  showShortVersion?: number | undefined;
  data: any;
}

export interface LegibleColor {
  backgroundColor: string;
  textColor: string;
}

interface HighlightObject {
  text: string;
  highlighted: boolean;
  span?: HighlightSpan;
  color?: LegibleColor;
  nested?: HighlightObject;
  shortVersion?: {
    spans?: HighlightObject[];
  };
  isVisible?: boolean;
  fullText?: string;
  shortText?: string;
}

@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.component.html',
  styleUrls: ['./highlight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightComponent {
  static colors: Map<string, LegibleColor> = new Map<string, LegibleColor>([
    ['ORG', {backgroundColor: '#9FC2BA', textColor: 'black'}],
    ['PER', {backgroundColor: '#DDB0A0', textColor: 'black'}],
    ['GPE', {backgroundColor: '#ffb2ff', textColor: 'black'}],
    ['LOC', {backgroundColor: '#CABD80', textColor: 'black'}],
    ['ADDR', {backgroundColor: '#8f9bff', textColor: 'black'}],
    ['COMPANY', {backgroundColor: '#75a7ff', textColor: 'black'}],
    ['PHO', {backgroundColor: '#ff867f', textColor: 'black'}],
    ['EMAIL', {backgroundColor: '#9fffe0', textColor: 'black'}],
  ]);
  static linkify = new LinkifyIt();
  static readonly HYPERLINKS_COL = AppConfigService.settings.fileFieldReplace; // hosted_filepath
  highlightArray: HighlightObject[] = [];
  textHidden = true;
  listenerList: (() => any)[] = [];

  constructor(private renderer2: Renderer2, private el: ElementRef, private cdrf: ChangeDetectorRef) {
    this.cdrf.detach();
  }

  // tslint:disable:no-any
  // tslint:disable:variable-name
  _highlightConfig: HighlightConfig;

  @Input() set highlightConfig(highlightConfig: HighlightConfig) {
    this._highlightConfig = highlightConfig;
    this.makeHighlightArray(highlightConfig);
  }

  static generateColorsForFacts(facts: { fact: string }[]): Map<string, LegibleColor> {
    facts.forEach(fact => {
      if (!HighlightComponent.colors.has(fact.fact)) {
        // tslint:disable-next-line:no-bitwise
        HighlightComponent.colors.set(fact.fact, {
          backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
          textColor: 'black'
        });
      }
    });
    return HighlightComponent.colors;
  }

  // convert searcher highlight into mlp fact format
  static makeSearcherHighlights(searcherHighlight: any, currentColumn: string): HighlightSpan[] {
    const highlight = searcherHighlight ? searcherHighlight[currentColumn] : null;
    if (highlight && highlight.length === 1) { // elasticsearch returns as array
      const highlightArray: HighlightSpan[] = [];
      const columnText: string = highlight[0]; // highlight number of fragments has to be 0
      const splitStartTag: string[] = columnText.split(HighlightSettings.PRE_TAG);
      let previousIndex = 0; // char start index of highlight
      for (const row of splitStartTag) {
        const endTagIndex = row.indexOf(HighlightSettings.POST_TAG);
        if (endTagIndex > 0) {
          const f: HighlightSpan = {} as HighlightSpan;
          f.doc_path = currentColumn;
          f.fact = '';
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
      return highlightArray;
    }
    return [];
  }

  static makeHyperlinksClickable(currentColumnData: unknown, colName: string): HighlightSpan[] {
    // Very quick check, that can give false positives.
    if (colName === HighlightComponent.HYPERLINKS_COL) {
      currentColumnData = `${AppConfigService.settings.apiHost}/${currentColumnData}`;
    }
    if (isNaN(Number(currentColumnData)) && HighlightComponent.linkify.pretest(currentColumnData as string)) {
      const highlightArray: HighlightSpan[] = [];
      const matches = HighlightComponent.linkify.match(currentColumnData as string);
      if (matches && matches.length > 0) {
        for (const match of matches) {
          const f: HighlightSpan = {} as HighlightSpan;
          f.doc_path = colName;
          f.fact = '';
          f.urlSpan = true;
          f.spans = `[[${match.index}, ${match.lastIndex}]]`;
          f.str_val = match.url;
          highlightArray.push(f);
        }
      }
      return highlightArray;
    }
    return [];
  }

  static makeShowShortVersion(maxWordDistance: number, highlightObjects: HighlightObject[], currentColumn: string): HighlightObject[] {
    const showShortVersionHighlightObjects: HighlightObject[] = [];
    let parentShortVersionSpan: HighlightObject | undefined;
    let colHasSearcherHighlight = false;
    for (let index = 0; index < highlightObjects.length; index++) {
      const highlightObject = highlightObjects[index];
      if (!parentShortVersionSpan) {
        parentShortVersionSpan = {
          text: '',
          highlighted: false,
          shortVersion: {spans: [highlightObject]}, isVisible: false,
        };
      } else if (parentShortVersionSpan && HighlightComponent.highlightHasSearcherHighlight(highlightObject)) {
        parentShortVersionSpan.isVisible = false;
        colHasSearcherHighlight = true;
        showShortVersionHighlightObjects.push(parentShortVersionSpan);
        showShortVersionHighlightObjects.push(highlightObject);
        parentShortVersionSpan = undefined;
      } else if (parentShortVersionSpan) {
        if (parentShortVersionSpan?.shortVersion?.spans) {
          parentShortVersionSpan.shortVersion.spans.push(highlightObject);
        }
      }
    }
    if (parentShortVersionSpan) {
      showShortVersionHighlightObjects.push(parentShortVersionSpan);
    }

    showShortVersionHighlightObjects.forEach(x => x.shortVersion?.spans?.forEach(y => y.isVisible = false));
    return HighlightComponent.cutShortVersionExtraText(showShortVersionHighlightObjects, maxWordDistance) || [];

  }

  static cutShortVersionExtraText(highlights: HighlightObject[], maxWordDistance: number): HighlightObject[] {
    const newArray: HighlightObject[] = [];
    const wordRegex = RegExp(/\w/);
    for (let index = 0; index < highlights.length; index++) {
      const x = highlights[index];
      if (x.shortVersion?.spans && index === 0) {// start // todo
        let wordCount = 0;
        for (let i = x.shortVersion.spans.length - 1; i >= 0; i--) {
          x.shortVersion.spans[i].isVisible = true;
          x.shortVersion.spans[i].shortText = x.shortVersion.spans[i].text;
          wordCount += HighlightComponent.setSpanShortVersion(x.shortVersion.spans[i], 'end', maxWordDistance - wordCount, wordRegex);
          if (wordCount === maxWordDistance) {
            x.shortVersion.spans.splice(i, 0, {text: '... ', fullText: '... ', highlighted: false, isVisible: true});
            break;
          }
        }
      } else if (HighlightComponent.highlightHasSearcherHighlight(highlights[index - 1]) && HighlightComponent.highlightHasSearcherHighlight(highlights[index + 1])) { // middle
        // check text length to see if we even need to shorten anything
        const concentatedText = x.shortVersion?.spans?.map(text => text.text).join('') || '';
        const frontWordCount = concentatedText.split(/(\s)/g).filter(y => !!y);
        const totalWords: number = frontWordCount.map(y => {
          if (wordRegex.test(y)) {
            return y;
          }
          return '';
        }).filter(y => !!y).length;
        if (totalWords > maxWordDistance * 2) {
          // shorten start first
          let wordCount = 0;
          const spans = x?.shortVersion?.spans || [];
          for (let i = 0; i < spans.length; i++) {
            spans[i].isVisible = true;
            spans[i].shortText = spans[i].text;
            wordCount += HighlightComponent.setSpanShortVersion(spans[i], 'start', maxWordDistance - wordCount, wordRegex);
            if (spans.length === 1) {
              spans.splice(1, 0, {text: ' ... \n', fullText: ' ... \n', highlighted: false, isVisible: true});
              break;
            } else if (wordCount === maxWordDistance) {
              spans.splice(i + 1, 0, {text: ' ... \n', fullText: ' ... \n', highlighted: false, isVisible: true});
              break;
            }
          }
          // shorten end
          wordCount = 0;
          for (let i = spans.length - 1; i >= 0; i--) {
            if (wordCount === maxWordDistance) {
              break;
            }
            if (!spans[i].fullText) { // this is here so we dont modify the previous ' ... \n' span
              spans[i].isVisible = true;
              spans[i].shortText = spans[i].text;
            }
            const spanCopy = JSON.parse(JSON.stringify(spans[i]));
            const newWords = HighlightComponent.setSpanShortVersion(spanCopy, 'end', maxWordDistance - wordCount, wordRegex);
            wordCount += newWords;
            if (newWords && !spans[i].fullText) { // if newords and the span wasnt already modified by start
              spans.splice(i, 1, spanCopy);
            } else if (wordCount === maxWordDistance) {// if span was modified already then its last iteration anyway
              const insertIndex = spans.findIndex(y => y.text === ' ... \n');
              spans.splice(insertIndex + 1, 0, spanCopy);
              break;
            }
          }
        } else {
          x.shortVersion?.spans?.forEach(y => {
            y.shortText = y.text; // so i know which spans need to always be shown
            y.isVisible = true;
          });
        }
      } else if (x.shortVersion?.spans && index === highlights.length - 1) { // end
        let wordCount = 0;
        for (let i = 0; i < x.shortVersion.spans.length; i++) {
          if (wordCount === maxWordDistance) {
            x.shortVersion.spans.splice(i, 0, {text: ' ...', fullText: ' ...', highlighted: false, isVisible: true});
            break;
          }
          x.shortVersion.spans[i].isVisible = true;
          x.shortVersion.spans[i].shortText = x.shortVersion.spans[i].text;
          // lastspan
          wordCount += HighlightComponent.setSpanShortVersion(x.shortVersion.spans[i], 'start', maxWordDistance - wordCount, wordRegex);
          if (x.shortVersion.spans.length === 1 && wordCount === maxWordDistance) {
            x.shortVersion.spans.splice(1, 0, {text: ' ...', fullText: ' ...', highlighted: false, isVisible: true});
            break;
          }
        }
      }
      newArray.push(x);
    }
    return newArray;
  }

  static setSpanShortVersion(highlightObject: HighlightObject, startFrom: 'start' | 'end', maxWordDistance: number, wordRegex: RegExp): number {
    if (!highlightObject.fullText) {
      highlightObject.fullText = highlightObject.text;
    }
    if (startFrom === 'end') {
      const splitSpanText = highlightObject.fullText.split(/(\s)/g).filter(y => !!y);
      let wordCount = 0;
      const words: string[] = [];
      for (let i = splitSpanText.length - 1; wordCount < maxWordDistance && i >= 0; i--) {
        if (wordRegex.test(splitSpanText[i])) {
          wordCount += 1;
        }
        words.push(splitSpanText[i]);
        if (wordCount === maxWordDistance && splitSpanText[i - 1]) { // otherwise we would be trimming sentence ends, spaces, newlines etc
          words.push(splitSpanText[i - 1]);
        }
      }
      highlightObject.shortText = words.reverse().join('');
      highlightObject.text = highlightObject.shortText;
      return wordCount;
    } else if (startFrom === 'start') {
      const splitSpanText = highlightObject.fullText.split(/(\s)/g).filter(y => !!y);
      let wordCount = 0;
      const words: string[] = [];
      for (let i = 0; wordCount < maxWordDistance && i < splitSpanText.length; i++) {
        if (wordRegex.test(splitSpanText[i])) {
          wordCount += 1;
        }
        words.push(splitSpanText[i]);
        if (wordCount === maxWordDistance && splitSpanText[i + 1]) { // otherwise we would be trimming sentence ends, spaces, newlines etc
          words.push(splitSpanText[i + 1]);
        }
      }
      highlightObject.shortText = words.join('');
      highlightObject.text = highlightObject.shortText;
      return wordCount;
    }
    return 0;
  }

  static highlightHasSearcherHighlight(highlight: HighlightObject): boolean {
    const stack: HighlightObject[] = [];
    if (highlight) {
      stack.push(highlight);
    }
    while (stack.length) {
      if (stack[0].span?.searcherHighlight) {
        return true;
      } else if (stack[0].nested) {
        stack.push(stack[0].nested);
      }
      stack.shift();
    }
    return false;
  }

  toggleShowShortVersion(span: HighlightObject): void {
    let lastFullTextSpan: HighlightObject | undefined;
    span.shortVersion?.spans?.forEach(x => {
      if (!span.isVisible) { // if showing
        if (x.fullText && x.shortText) {
          if (lastFullTextSpan?.fullText === x.fullText) {
            x.isVisible = !x.isVisible;
          }
          x.text = x.fullText;
          lastFullTextSpan = x;
        } else {
          // if its an unmodified span, dont switch visible state
          // they should always be visible because they fit the word context range
          if (x.fullText || !x.isVisible) {
            x.isVisible = !x.isVisible;
          }
        }
      } else {
        if (x.fullText && x.shortText) {
          if (lastFullTextSpan?.fullText === x.fullText) {
            x.isVisible = !x.isVisible;
          }
          x.text = x.shortText || '';
          lastFullTextSpan = x;
        } else {
          // if its an unmodified span, dont switch visible state
          // they should always be visible because they fit the word context range
          if (!x.isVisible || !x.shortText) {
            x.isVisible = !x.isVisible;
          }
        }
      }
    });
    span.isVisible = !span.isVisible;
  }

  toggleAllShowShortVersions(): void {
    this.highlightArray.forEach(x => {
      if (x.shortVersion?.spans) {
        if (x.isVisible === !this.textHidden) {
          this.toggleShowShortVersion(x);
        }
      }
    });
    this.textHidden = !this.textHidden;
  }


  makeHighlightArray(highlightConfig: HighlightConfig): void {
    if (highlightConfig.data[highlightConfig.currentColumn] !== null && highlightConfig.data[highlightConfig.currentColumn] !== undefined) {
      let fieldFacts: HighlightSpan[] = [];
      let hyperLinks: HighlightSpan[] = [];
      if (highlightConfig.highlightTextaFacts) {
        fieldFacts = this.constructFactArray(highlightConfig);
      }
      // elastic fields arent trimmed by default, so elasticsearch highlights are going to be misaligned because
      // elasticsearch highlighter trims the field, MLP also trims the field
      // trim it here cause we need to get hyperlinks with trimmed columndata so it wouldnt be misaligned
      if ((isNaN(Number(highlightConfig.data[highlightConfig.currentColumn])))) {
        highlightConfig.data[highlightConfig.currentColumn] = highlightConfig.data[highlightConfig.currentColumn].trim();
      }
      if (highlightConfig.highlightHyperlinks) {
        hyperLinks = HighlightComponent.makeHyperlinksClickable(highlightConfig.data[highlightConfig.currentColumn],
          highlightConfig.currentColumn);
      }

      const highlightTerms = [
        ...hyperLinks,
        ...HighlightComponent.makeSearcherHighlights(highlightConfig.searcherHighlight, highlightConfig.currentColumn),
        ...fieldFacts
      ];
      const colors = HighlightComponent.generateColorsForFacts(highlightTerms);
      const highlights = this.makeHighLights(highlightConfig.data[highlightConfig.currentColumn], highlightTerms, colors);
      if (highlightConfig.showShortVersion) {
        this.highlightArray = HighlightComponent.makeShowShortVersion(highlightConfig.showShortVersion, highlights,
          highlightConfig.data[highlightConfig.currentColumn]);
      } else {
        this.highlightArray = highlights;
      }
    } else {
      this.highlightArray = [];
    }
    this.renderDom(this.highlightArray);
  }

  constructFactArray(highlightConfig: HighlightConfig): HighlightSpan[] {
    let fieldFacts: HighlightSpan[];
    fieldFacts = this.getFactsByField(highlightConfig.data, highlightConfig.currentColumn);
    if (highlightConfig.onlyHighlightMatching && fieldFacts.length > 0) {
      fieldFacts = this.getOnlyMatchingFacts(fieldFacts, highlightConfig);
    }
    fieldFacts = UtilityFunctions.getDistinctByProperty<HighlightSpan>(fieldFacts, (x => x.spans));
    return fieldFacts;
  }

  getOnlyMatchingFacts(fieldFacts: HighlightSpan[], highlightConfig: HighlightConfig): HighlightSpan[] {
    if (fieldFacts && highlightConfig?.onlyHighlightMatching && highlightConfig.onlyHighlightMatching.length > 0) {
      // if these exist match all facts of the type, PER, LOC, ORG etc. gets all unique global fact names
      const globalFacts = [...new Set([].concat.apply([], highlightConfig.onlyHighlightMatching.map(x => x.factNameFormControl.value)))];
      // get all unique fact names and their values as an object
      // @ts-ignore
      const factValues = [...new Set([].concat.apply([], (highlightConfig.onlyHighlightMatching.map(x => x.inputGroupArray.map(y => {
        return {value: y.factTextInputFormControl.value, name: y.factTextFactNameFormControl.value};
      })))))] as { value: string, name: string }[];
      return JSON.parse(JSON.stringify(fieldFacts.filter((fact: HighlightSpan) => {
        // @ts-ignore
        if (globalFacts.includes(fact.fact)) {
          return fact;
        } else if (factValues.find(x => x.name === fact.fact)) {
          if (factValues.find(x => x.value === fact.str_val)) {
            return fact;
          }
        }
      })));
    }
    return fieldFacts;
  }

  // tslint:disable-next-line:no-any
  getFactsByField(factArray: any, columnName: string): HighlightSpan[] {
    factArray = factArray.texta_facts;
    if (factArray) {
      return JSON.parse(JSON.stringify(factArray.filter((fact: HighlightSpan) => {
        if (fact.doc_path === columnName) {
          return fact;
        }
      })));
    }
    return [];
  }

  private makeHighLights(originalText: string | number, facts: HighlightSpan[], factColors: Map<string, LegibleColor>): HighlightObject[] {
    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });
    // remove document wide facts and empty facts (facts that have same span start and end index)
    facts = facts.filter(x => x.spans[0] !== x.spans[1]);
    // column content can be number, convert to string
    originalText = originalText.toString();
    if (facts.length === 0) {
      if (originalText.length < 400) {
        return [{text: originalText, highlighted: false}];
      } else { // chrome cant handle rendering large chunks of text, 90% perf improvement on large texts
        const numChunks = Math.ceil(originalText.length / 400);
        const chunks = new Array(numChunks);

        for (let i = 0, o = 0; i < numChunks; ++i, o += 400) {
          chunks[i] = {text: originalText.substr(o, 400), highlighted: false};
        }
        return chunks;
      }

    }

    // need this sort for fact priority
    facts.sort(this.sortByStartLowestSpan);

    const highlightArray: HighlightObject[] = [];
    const overLappingFacts = this.detectOverlappingFacts(facts);
    let factText = '';
    let lowestSpanNumber: number | null = facts[0].spans[0] as number;
    for (let i = 0; i <= originalText.length; i++) {
      let fact: HighlightSpan | undefined;
      // get next span position when needed
      if (lowestSpanNumber !== null && i >= lowestSpanNumber) {
        fact = this.getFactByStartSpan(i, facts);
        lowestSpanNumber = this.getFactWithStartSpanHigherThan(i, facts);
      }

      if (fact !== undefined && fact.spans[0] !== fact.spans[1]) {
        if (this.isOverLappingFact(overLappingFacts, fact)) {
          // push old non fact text into array
          highlightArray.push({text: factText, highlighted: false});
          factText = '';
          // highlightarray is updated inside this function, return new loop index (where to resume from)
          i = this.makeFactNested(highlightArray, fact, overLappingFacts, i, originalText, factColors);
        } else {
          // push old non fact text into array
          highlightArray.push({text: factText, highlighted: false});
          factText = '';
          // make a regular fact, highlightarray updated inside function, return new loop index
          i = this.makeFact(highlightArray, fact, i, originalText, factColors);
        }
      } else {
        if (!lowestSpanNumber) {
          factText += originalText.slice(i, originalText.length);
          i = originalText.length;
        } else {
          factText += originalText.slice(i, lowestSpanNumber);
          i = lowestSpanNumber - 1;
        }
      }
    }

    if (factText !== '') {
      // if the last substring in the whole string wasnt a fact
      // that means there was no way for it to be added into the highlightarray,
      // push non fact text into array
      highlightArray.push({text: factText, highlighted: false});
    }

    return highlightArray;
  }

  private isOverLappingFact(overLappingFacts: Map<HighlightSpan, HighlightSpan[]>, fact: HighlightSpan): boolean {
    for (let i = 0; i < overLappingFacts.size; i++) {
      if (Array.from(overLappingFacts.keys()).includes(fact)) {
        return true;
      }
    }
    return false;
  }

  private makeFactNestedHighlightRecursive(highlightObject: HighlightObject, factToInsert: HighlightSpan | undefined,
                                           color: LegibleColor | undefined, textToInsert: string): HighlightObject {
    let stack = highlightObject;
    while (stack) {
      if (stack.nested === undefined) {
        stack.nested = {
          text: textToInsert,
          highlighted: true,
          span: factToInsert,
          color,
          nested: undefined
        };
        break;
      } else {
        stack = stack.nested as HighlightObject;
      }
    }
    return highlightObject;
  }

  // need to write tests to see if this works, might refactor
  private makeFactNested(
    highlightArray: HighlightObject[],
    rootFact: HighlightSpan,
    overLappingFacts: Map<HighlightSpan, HighlightSpan[]>,
    loopIndex: number,
    originalText: string,
    colors: Map<string, LegibleColor>): number {
    // deep copy
    const nestedFacts: HighlightSpan[] = JSON.parse(JSON.stringify(overLappingFacts.get(rootFact)));
    // highest span value in nestedfacts
    const highestSpanValue = new Map<HighlightSpan, number>();
    for (const factNested of nestedFacts) {
      // @ts-ignore
      highestSpanValue.set(factNested, Math.max.apply(Math, factNested.spans));
    }
    let highlightObject: HighlightObject | undefined;
    let factText = '';
    let previousFact: HighlightSpan | undefined;
    const factsToDelete: HighlightSpan[] = [];
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
  private startOfFact(nestedFacts: HighlightSpan[], loopIndex: number, previousFact: HighlightSpan | undefined): HighlightSpan | undefined {
    const facts: HighlightSpan[] = nestedFacts.filter(e => (e.spans[0] === loopIndex));
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

  private makeFact(highlight: HighlightObject[], fact: HighlightSpan, loopIndex: number, originalText: string,
                   colors: Map<string, LegibleColor>): number {
    let newText = '';
    const factFinalSpanIndex = fact.spans[1] as number;
    newText += originalText.slice(loopIndex, factFinalSpanIndex);
    loopIndex = factFinalSpanIndex;
    highlight.push({text: newText, highlighted: true, span: fact, color: colors.get(fact.fact)});
    // - 1 because loop is escaped
    return loopIndex - 1;

  }

  private detectOverlappingFacts(facts: HighlightSpan[]): Map<HighlightSpan, HighlightSpan[]> {
    let overLappingFacts: Map<HighlightSpan, HighlightSpan[]> = new Map<HighlightSpan, HighlightSpan[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
      overLappingFacts = this.detectOverLappingFactsDrill(facts[0], facts, facts[0].spans[1] as number, 1, overLappingFacts);
    }

    return overLappingFacts;
  }

  private detectOverLappingFactsDrill(factRoot: HighlightSpan, facts: HighlightSpan[], endSpan: number, index: number,
                                      nestedArray: Map<HighlightSpan, HighlightSpan[]>): Map<HighlightSpan, HighlightSpan[]> {
    // endSpan = previous facts span ending so we can make long chains of nested facts
    if (index < facts.length) {
      if (facts[index].spans[0] < endSpan) {
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

  private sortByStartLowestSpan(a: HighlightSpan, b: HighlightSpan): -1 | 1 {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

  private renderDom(highlightArray: HighlightObject[]): void {
    // incase we are rerendering destroy all previous eventlisteners
    this.listenerList.forEach(x => {
      x();
    });
    const wrapper = this.renderer2.createElement('div');
    if (!this._highlightConfig?.showShortVersion) {
      for (const highlight of highlightArray) {
        this.renderHighlightTemplate(wrapper, highlight);
      }
    } else {
      for (const highlight of highlightArray) {
        if (highlight?.shortVersion?.spans) {
          for (const spans of highlight.shortVersion.spans) {
            const s = this.renderer2.createElement('span');
            this.renderer2.setStyle(s, 'cursor', 'pointer');
            const removeListener = this.renderer2.listen(s, 'click', ($event) => {
              this.toggleShowShortVersion(highlight);
              this.renderer2.removeChild(this.el.nativeElement, wrapper);
              this.renderDom(highlightArray);
            });
            this.listenerList.push(removeListener);
            this.renderer2.appendChild(wrapper, s);
            if (spans.isVisible) {
              this.renderHighlightTemplate(s, spans);
            }
          }
        } else if (!highlight?.shortVersion?.spans) {
          this.renderHighlightTemplate(wrapper, highlight);
        }
      }
    }
    this.renderer2.appendChild(this.el.nativeElement, wrapper);
  }

  private renderFactTemplate(wrapper: any, highlight: HighlightObject): void {
    if (highlight.span?.urlSpan) {
      const a = this.renderer2.createElement('a');
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.setProperty(a, 'target', '_blank');
      this.renderer2.appendChild(a, t);
      this.renderer2.appendChild(wrapper, a);
    } else if (!highlight.span?.urlSpan) {
      const s = this.renderer2.createElement('span');
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.setStyle(s, 'background-color', highlight?.color?.backgroundColor);
      this.renderer2.setStyle(s, 'color', highlight?.color?.textColor);
      this.renderer2.setStyle(s, 'cursor', 'pointer');
      this.renderer2.setProperty(s, 'title', `${highlight.span?.fact} ${highlight.span?.str_val}`);
      this.renderer2.appendChild(s, t);
      this.renderer2.appendChild(wrapper, s);
    } else if (highlight.nested) {
      this.renderFactTemplate(wrapper, highlight);
    }
  }

  private renderHighlightTemplate(wrapper: any, highlight: HighlightObject): void {
    if (highlight.highlighted && !highlight.span?.searcherHighlight && !highlight.span?.urlSpan) {
      const s = this.renderer2.createElement('span');
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.setStyle(s, 'background-color', highlight?.color?.backgroundColor);
      this.renderer2.setStyle(s, 'color', highlight?.color?.textColor);
      this.renderer2.setStyle(s, 'cursor', 'pointer');
      this.renderer2.appendChild(s, t);
      this.renderer2.appendChild(wrapper, s);
    } else if (highlight.highlighted && highlight.span?.searcherHighlight) {
      const s = this.renderer2.createElement('span');
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.setStyle(s, 'background-color', highlight?.color?.backgroundColor);
      this.renderer2.setStyle(s, 'color', highlight?.color?.textColor);
      this.renderer2.setStyle(s, 'cursor', 'pointer');
      this.renderer2.setProperty(s, 'title', `${highlight.span?.fact} ${highlight.span?.str_val}`);
      this.renderer2.appendChild(s, t);
      this.renderer2.appendChild(wrapper, s);
    } else if (highlight.highlighted && highlight.span?.urlSpan) {
      const a = this.renderer2.createElement('a');
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.setProperty(a, 'target', '_blank');
      this.renderer2.appendChild(a, t);
      this.renderer2.appendChild(wrapper, a);
    } else if (highlight.nested) {
      this.renderFactTemplate(wrapper, highlight);
    } else if (!highlight.highlighted) {
      const t = this.renderer2.createText(highlight.text);
      this.renderer2.appendChild(wrapper, t);
    }
  }
}

HighlightComponent.linkify.set({fuzzyLink: false, fuzzyEmail: false});

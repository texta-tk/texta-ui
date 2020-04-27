import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ElasticsearchQuery, FactConstraint} from '../../searcher-sidebar/build-search/Constraints';
import * as LinkifyIt from 'linkify-it';

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
  data: any;
}

interface HighlightObject {
  text: string;
  highlighted: boolean;
  span?: HighlightSpan;
  color?: string;
  nested?: HighlightObject;
}


@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.component.html',
  styleUrls: ['./highlight.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighlightComponent {
  static colors: Map<string, string> = new Map<string, string>();
  static linkify = new LinkifyIt();
  highlightArray: HighlightObject[] = [];

  constructor() {
  }

  @Input() set highlightConfig(highlightConfig: HighlightConfig) {
    if (highlightConfig.data[highlightConfig.currentColumn] !== null && highlightConfig.data[highlightConfig.currentColumn] !== undefined) {
      let fieldFacts = this.getFactsByField(highlightConfig.data, highlightConfig.currentColumn);
      if (highlightConfig.onlyHighlightMatching && fieldFacts.length > 0) {
        fieldFacts = this.getOnlyMatchingFacts(fieldFacts, highlightConfig); // todo
      }
      fieldFacts = this.removeDuplicates(fieldFacts, 'spans');
      // elastic fields arent trimmed by default, so elasticsearch highlights are going to be misaligned because
      // elasticsearch highlighter trims the field, MLP also trims the field
      // trim it here cause we need to get hyperlinks with trimmed columndata so it wouldnt be misaligned
      if ((isNaN(Number(highlightConfig.data[highlightConfig.currentColumn])))) {
        highlightConfig.data[highlightConfig.currentColumn] = highlightConfig.data[highlightConfig.currentColumn].trim();
      }
      const highlightTerms = [
        ...this.makeHyperlinksClickable(highlightConfig.data[highlightConfig.currentColumn], highlightConfig.currentColumn),
        ...HighlightComponent.makeSearcherHighlights(highlightConfig.searcherHighlight, highlightConfig.currentColumn),
        ...fieldFacts
      ];
      const colors = HighlightComponent.generateColorsForFacts(highlightTerms);
      this.highlightArray = this.makeHighLights(highlightConfig.data[highlightConfig.currentColumn], highlightTerms, colors);
    } else {
      this.highlightArray = [];
    }
  }

  static generateColorsForFacts(facts: HighlightSpan[]): Map<string, string> {
    const colorPallette = this.generateRandomColors(facts.length);
    facts.forEach(fact => {
      if (!HighlightComponent.colors.has(fact.fact) && colorPallette) {
        HighlightComponent.colors.set(fact.fact, colorPallette[0]);
        colorPallette.shift();
      }
    });
    return HighlightComponent.colors;
  }

  static generateRandomColors(numberOfRandomColors: number) {
    const output: string[] = [];
    const max = 0xfff;
    for (let i = 0; i < numberOfRandomColors; i++) {
      output.push('#' + (Math.round(Math.random() * (max - 0xf77)) + 0xf77).toString(16));
    }
    return output;
  }

  // convert searcher highlight into mlp fact format
  static makeSearcherHighlights(searcherHighlight: any, currentColumn: string): HighlightSpan[] {
    const highlight = searcherHighlight[currentColumn];
    if (highlight && highlight.length === 1) {
      const highlightArray: HighlightSpan[] = [];
      const columnText: string = highlight[0]; // highlight number of fragments has to be 0
      const splitStartTag: string[] = columnText.split(ElasticsearchQuery.PRE_TAG);
      let previousIndex = 0; // char start index of highlight
      for (const row of splitStartTag) {
        const endTagIndex = row.indexOf(ElasticsearchQuery.POST_TAG);
        if (endTagIndex > 0) {
          const f: HighlightSpan = {} as HighlightSpan;
          f.doc_path = currentColumn;
          f.fact = '';
          f.searcherHighlight = true;
          f.spans = `[[${previousIndex}, ${previousIndex + endTagIndex}]]`;
          f.str_val = 'searcher highlight';
          highlightArray.push(f);
          const rowClean = row.replace(ElasticsearchQuery.POST_TAG, '');
          previousIndex = previousIndex + rowClean.length;
        } else {
          previousIndex = previousIndex + row.length;
        }
      }
      return highlightArray;
    }
    return [];
  }

  makeHyperlinksClickable(currentColumn: string | number, colName: string): HighlightSpan[] {
    // Very quick check, that can give false positives.
    if (isNaN(Number(currentColumn)) && HighlightComponent.linkify.pretest(currentColumn as string)) {
      const highlightArray: HighlightSpan[] = [];
      const matches = HighlightComponent.linkify.match(currentColumn as string);
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

  getOnlyMatchingFacts(fieldFacts: HighlightSpan[], highlightConfig: HighlightConfig): HighlightSpan[] {
    if (fieldFacts && highlightConfig && highlightConfig.onlyHighlightMatching) {
      // if these exist match all facts of the type, PER, LOC, ORG etc. gets all unique global fact names
      const globalFacts = [...new Set([].concat.apply([], highlightConfig.onlyHighlightMatching.map(x => x.factNameFormControl.value)))];
      // get all unique fact names and their values as an object
      const factValues = [...new Set([].concat.apply([], (highlightConfig.onlyHighlightMatching.map(x => x.inputGroupArray.map(y => {
        return {value: y.factTextInputFormControl.value, name: y.factTextFactNameFormControl.value};
      })))))] as { value: string, name: string }[];
      return JSON.parse(JSON.stringify(fieldFacts.filter((fact: HighlightSpan) => {
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

  getFactsByField(factArray, columnName): HighlightSpan[] {
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

  private makeHighLights(originalText: string | number, facts: HighlightSpan[], factColors: Map<string, string>): HighlightObject[] {
    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
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

  private makeFactNestedHighlightRecursive(highlightObject: HighlightObject, factToInsert, color, textToInsert): HighlightObject {
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
    highlightArray: HighlightObject[],
    rootFact: HighlightSpan,
    overLappingFacts: Map<HighlightSpan, HighlightSpan[]>,
    loopIndex: number,
    originalText: string,
    colors: Map<string, string>): number {
    // deep copy
    const nestedFacts: HighlightSpan[] = JSON.parse(JSON.stringify(overLappingFacts.get(rootFact)));
    // highest span value in nestedfacts
    const highestSpanValue = new Map<HighlightSpan, number>();
    for (const factNested of nestedFacts) {
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
      // previousfact is actually current fact? todo
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

  private makeFact(highlight: HighlightObject[], fact: HighlightSpan, loopIndex: number, originalText: string, colors: Map<string, string>)
    : number {
    let newText = '';
    const factFinalSpanIndex = fact.spans[1] as number;
    newText += originalText.slice(loopIndex, factFinalSpanIndex);
    loopIndex = factFinalSpanIndex;
    highlight.push({text: newText, highlighted: true, span: fact, color: colors.get(fact.fact)});
    // - 1 because loop is escaped
    return loopIndex - 1;

  }

  private removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  private detectOverlappingFacts(facts: HighlightSpan[]): Map<HighlightSpan, HighlightSpan[]> {
    let overLappingFacts: Map<HighlightSpan, HighlightSpan[]> = new Map<HighlightSpan, HighlightSpan[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
      overLappingFacts = this.detectOverLappingFactsDrill(facts[0], facts, facts[0].spans[1] as number, 1, overLappingFacts);
    }

    return overLappingFacts;
  }

  private detectOverLappingFactsDrill(factRoot: HighlightSpan, facts: HighlightSpan[], endSpan: number,
                                      index: number, nestedArray: Map<HighlightSpan, HighlightSpan[]>): Map<HighlightSpan, HighlightSpan[]> {
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

  private sortByStartLowestSpan(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

}

HighlightComponent.linkify.set({fuzzyLink: false, fuzzyEmail: false});

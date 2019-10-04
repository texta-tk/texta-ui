import {Component, Input, OnInit} from '@angular/core';


export interface TextaFact {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
  id?: number;
  searcherHighlight?: boolean;
}


@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.component.html',
  styleUrls: ['./highlight.component.sass']
})
export class HighlightComponent implements OnInit {

  highlightArray: HighlightObject[] = [];

  // make this into an input variable, dont need it right now tho
  // json at root level is: [text, texta_facts], text is the defaultentrypoint
  // doc_path text.[columnName]
  @Input() currentColumn: string;

  _searchTerm: string;
  get searchTerm(): string {
    return this._searchTerm;
  }

  @Input() set searchTerm(value: string) {
    this._searchTerm = value;
  }

  @Input() set JsonResponse(data: any) { // todo data
    let textaFieldFacts = this.getFactsByField(data, this.currentColumn);
    textaFieldFacts = this.removeDuplicates(textaFieldFacts, 'spans')
    const highlightTerms = [
      ...this.makeSearcherHighlightFacts(data[this.currentColumn], this.searchTerm, this.currentColumn),
      ...textaFieldFacts];
    const colors = this.generateColorsForFacts(highlightTerms);
    this.highlightArray = this.makeHighLights(data[this.currentColumn], highlightTerms, colors);
  }

  // todo temp, searcher highlight 
  makeSearcherHighlightFacts(columnData: any, searchTerm: string, column: string) { // todo this whole function is TEMP
    const searcherHighLights: TextaFact[] = [];
    let start = 0;
    if (searchTerm && columnData) {
      while (start < columnData.length) {
        const termStart = columnData.toLowerCase().indexOf(searchTerm.toLowerCase(), start);
        if (termStart === -1) {
          break;
        }
        const termEnd = termStart + searchTerm.length;
        start = termEnd;
        const f: TextaFact = {} as TextaFact;
        f.doc_path = column;
        f.fact = '';
        f.searcherHighlight = true;
        f.spans = `[[${termStart}, ${termEnd}]]`;
        f.str_val = 'searcher highlight';
        searcherHighLights.push(f);
      }
    }
    return searcherHighLights;
  }

  constructor() {
  }

  getFactsByField(factArray, columnName): TextaFact[] {
    factArray = factArray.texta_facts;
    if (factArray) {
      return JSON.parse(JSON.stringify(factArray.filter((fact: TextaFact) => {
        if (fact.doc_path === columnName) {
          return fact;
        }
      })));
    }
    return [];
  }

  generateColorsForFacts(facts: TextaFact[]): Map<string, string> {
    const colorPallette = this.generateRandomColors(facts.length);
    const colors: Map<string, string> = new Map<string, string>();
    facts.forEach(fact => {
      if (!colors.has(fact.fact) && colorPallette) {
        colors.set(fact.fact, colorPallette[0]);
        colorPallette.shift();
      }
    });
    return colors;
  }

  private makeHighLights(originalText: string, facts: TextaFact[], factColors: Map<string, string>): HighlightObject[] {
    if (facts.length === 0) {
      return [{text: originalText, highlighted: false}];
    }

    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });
    // need this sort for fact priority
    facts.sort(this.sortByStartLowestSpan);

    const highlightArray: HighlightObject[] = [];
    const overLappingFacts = this.detectOverlappingFacts(facts);
    let factText = '';

    for (let i = 0; i <= originalText.length; i++) {
      const fact = this.indexInStartOfFactSpan(i, facts); // sort order only
      if (fact && fact.spans[0] !== fact.spans[1]) {
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
        factText += originalText.charAt(i);
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

  private isOverLappingFact(overLappingFacts: Map<TextaFact, TextaFact[]>, fact: TextaFact): boolean {
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
        fact: factToInsert,
        color: color,
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
    rootFact: TextaFact,
    overLappingFacts: Map<TextaFact, TextaFact[]>,
    loopIndex: number,
    originalText: string,
    colors: Map<string, string>): number {
    // deep copy
    const nestedFacts: TextaFact[] = JSON.parse(JSON.stringify(overLappingFacts.get(rootFact)));
    // highest span value in nestedfacts
    const highestSpanValue = new Map<TextaFact, number>();
    for (const factNested of nestedFacts) {
      highestSpanValue.set(factNested, Math.max.apply(Math, factNested.spans));
    }
    let highlightObject: HighlightObject;
    let factText = '';
    let previousFact: TextaFact;
    const factsToDelete: TextaFact[] = [];
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
            fact: rootFact,
            color: colors.get(rootFact.fact),
            nested: undefined
          };
          factText = '';
          previousFact = factCurrentIndex;
        } else {
          highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, previousFact,
            colors.get(previousFact.fact),
            factText);
          factText = '';
          previousFact = factCurrentIndex;
        }
      }
      if (highestSpanValue.get(previousFact) === i || (rootFact.spans[1] === i && !nestedFacts.includes(previousFact))) {
        if (factText !== '') {
          if (!highlightObject) {
            highlightObject = {
              text: factText,
              highlighted: true,
              fact: rootFact,
              color: colors.get(rootFact.fact),
              nested: undefined
            };
            factText = '';
            previousFact = factCurrentIndex;
          } else {
            factCurrentIndex = previousFact;
            highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, factCurrentIndex,
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
            highlightArray.push(highlightObject);
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
  private startOfFact(nestedFacts: TextaFact[], loopIndex: number, previousFact: TextaFact): TextaFact {
    const facts: TextaFact[] = nestedFacts.filter(e => (e.spans[0] === loopIndex));
    if (facts.length > 0) {
      if (facts.length > 1) {
        for (const fact of facts) {
          if (fact.searcherHighlight) {
            return fact;
          }
        }
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

  private makeFact(highlight: HighlightObject[], fact: TextaFact, loopIndex: number, originalText: string, colors: Map<string, string>)
    : number {
    let newText = '';
    for (let i = loopIndex; i <= originalText.length; i++) {
      // use closing span number, otherwise we would get no text, no nested facts
      if (fact.spans[1] === i) {
        highlight.push({text: newText, highlighted: true, fact: fact, color: colors.get(fact.fact)});
        // - 1 because loop is escaped
        return i - 1;
      }
      newText += originalText.charAt(i);
    }
  }

  private removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
    })
  }

  private detectOverlappingFacts(facts: TextaFact[]): Map<TextaFact, TextaFact[]> {
    let overLappingFacts: Map<TextaFact, TextaFact[]> = new Map<TextaFact, TextaFact[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
      let index = 1;

      overLappingFacts = this.detectOverLappingFactsDrill(facts[0], facts, facts[0].spans[1] as number, 1, overLappingFacts);
    }

    return overLappingFacts;
  }

  private detectOverLappingFactsDrill(factRoot: TextaFact, facts: TextaFact[], endSpan: number,
                                      index: number, nestedArray?: Map<TextaFact, TextaFact[]>): Map<TextaFact, TextaFact[]> {
    // endSpan = previous facts span ending so we can make long chains of nested facts 
    if (index < facts.length) {
      if (facts[index].spans[0] < endSpan) {
        endSpan = facts[index].spans[1] as number > endSpan ? facts[index].spans[1] as number : endSpan;
        // keep iterating with current fact till it finds one who isnt nested into this fact
        nestedArray.set(factRoot, nestedArray.has(factRoot) ? nestedArray.get(factRoot).concat(facts[index]) : [facts[index]]);
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

  private indexInStartOfFactSpan(loopIndex: number, facts: TextaFact[]): TextaFact {
    for (const fact of facts) {
      if ((<number[]>fact.spans)[0] === loopIndex) {
        return fact;
      }
    }
    return undefined;
  }

  private sortByStartLowestSpan(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

  private sortByStart(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return 0;
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }

  generateRandomColors(number) {
    const output: string[] = [];
    const max = 0xfff;
    for (let i = 0; i < number; i++) {
      output.push('#' + (Math.round(Math.random() * (max - 0xf77)) + 0xf77).toString(16));
    }
    return output;
  }

  ngOnInit() {

  }
}

interface HighlightObject {
  text: string;
  highlighted: boolean;
  fact?: TextaFact;
  color?: string;
  nested?: HighlightObject;
}

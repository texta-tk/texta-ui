import {Component, Input} from '@angular/core';
import {ElasticsearchQuery, FactConstraint} from '../../searcher-sidebar/build-search/Constraints';

export interface TextaFact {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
  id?: number;
  searcherHighlight?: boolean;
}

export interface HighlightConfig {
  currentColumn: string;
  searcherHighlight: any;
  onlyHighlightMatching?: FactConstraint[];
  data: any;
}


@Component({
  selector: 'app-highlight',
  templateUrl: './highlight.component.html',
  styleUrls: ['./highlight.component.sass']
})
export class HighlightComponent {
  static colors: Map<string, string> = new Map<string, string>();
  highlightArray: HighlightObject[] = [];
  id = 0; // for trackby template

  @Input() set highlightConfig(highlightConfig: HighlightConfig) { // todo data
    if (highlightConfig.data[highlightConfig.currentColumn]) {
      let fieldFacts = this.getFactsByField(highlightConfig.data, highlightConfig.currentColumn);
      if (highlightConfig.onlyHighlightMatching && fieldFacts.length > 0) {
        fieldFacts = this.getOnlyMatchingFacts(fieldFacts, highlightConfig);
      }
      fieldFacts = this.removeDuplicates(fieldFacts, 'spans');
      const highlightTerms = [
        ...this.makeSearcherHighlightFacts(highlightConfig.searcherHighlight, highlightConfig.currentColumn),
        ...fieldFacts];
      const colors = this.generateColorsForFacts(highlightTerms);
      this.highlightArray = this.makeHighLights(highlightConfig.data[highlightConfig.currentColumn], highlightTerms, colors);
    } else {
      this.highlightArray = [];
    }
  }

  constructor() {
  }

  makeSearcherHighlightFacts(searcherHighlight: any, currentColumn: string) {
    const highlightArray: TextaFact[] = [];
    for (const column in searcherHighlight) {
      if (column === currentColumn) {
        if (searcherHighlight[column].length === 1) {
          const columnText: string = searcherHighlight[column][0];
          const splitStartTag: string[] = columnText.split(ElasticsearchQuery.PRE_TAG);
          const splitEndTag: string[] = [];
          let previousIndex = 0;
          for (const row of splitStartTag) {
            const endTagIndex = row.indexOf(ElasticsearchQuery.POST_TAG);
            if (endTagIndex > 0) {
              const f: TextaFact = {} as TextaFact;
              f.doc_path = column;
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
            const splitRow: string[] = row.split(ElasticsearchQuery.POST_TAG);
            if (splitRow) {
              splitEndTag.push(...splitRow);
            }
          }
          // console.log(columnText);
        } else {
          console.error('highlight number of fragments has to be 0');
        }
      }
    }
    return highlightArray;
  }

  getOnlyMatchingFacts(fieldFacts: TextaFact[], highlightConfig: HighlightConfig): TextaFact[] {
    if (fieldFacts) {
      // if these exist match all facts of the type, PER, LOC, ORG etc. gets all unique global fact names
      const globalFacts = [...new Set([].concat.apply([], highlightConfig.onlyHighlightMatching.map(x => x.factNameFormControl.value)))];
      // get all unique fact names and their values as an object
      const factValues = [...new Set([].concat.apply([], (highlightConfig.onlyHighlightMatching.map(x => x.inputGroupArray.map(y => {
        return {value: y.factTextInputFormControl.value, name: y.factTextFactNameFormControl.value};
      })))))] as { value: string, name: string }[];
      return JSON.parse(JSON.stringify(fieldFacts.filter((fact: TextaFact) => {
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
    facts.forEach(fact => {
      if (!HighlightComponent.colors.has(fact.fact) && colorPallette) {
        HighlightComponent.colors.set(fact.fact, colorPallette[0]);
        colorPallette.shift();
      }
    });
    return HighlightComponent.colors;
  }


  private makeHighLights(originalText: string | number, facts: TextaFact[], factColors: Map<string, string>): HighlightObject[] {
    originalText = originalText.toString();
    if (facts.length === 0) {
      if (!originalText) {
        return [];
      }
      return [{text: originalText, highlighted: false, id: this.id++}];
    }
    // elastic fields arent trimmed by default, so elasticsearch highlights are going to be misaligned because
    // elasticsearch highlighter trims the field, MLP also trims the field
    originalText = originalText.trim(); // todo, will MLP always trim fields? is this fine?

    // spans are strings, convert them to 2d array and flatten
    facts.forEach(fact => {
      (fact.spans) = JSON.parse(fact.spans as string).flat();
    });
    // need this sort for fact priority
    facts.sort(this.sortByStartLowestSpan);

    const highlightArray: HighlightObject[] = [];
    const overLappingFacts = this.detectOverlappingFacts(facts);
    let factText = '';
    let lowestSpanNumber = facts[0].spans[0];
    for (let i = 0; i <= originalText.length; i++) {
      let fact = null;
      // performance update, dont loop over every fact on each character, get next span position instead when needed
      if (i === lowestSpanNumber || i > lowestSpanNumber) {
        fact = this.getFactByStartSpan(i, facts);
        lowestSpanNumber = this.getFactWithStartSpanHigherThan(i, facts);
      }

      if (fact && fact.spans[0] !== fact.spans[1]) {
        if (this.isOverLappingFact(overLappingFacts, fact)) {
          // push old non fact text into array
          highlightArray.push({text: factText, highlighted: false, id: this.id++});
          factText = '';
          // highlightarray is updated inside this function, return new loop index (where to resume from)
          i = this.makeFactNested(highlightArray, fact, overLappingFacts, i, originalText, factColors);
        } else {
          // push old non fact text into array
          highlightArray.push({text: factText, highlighted: false, id: this.id++});
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
      highlightArray.push({text: factText, highlighted: false, id: this.id++});
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
        color,
        nested: undefined, id: this.id++
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
            nested: undefined, id: this.id++
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
              nested: undefined, id: this.id++
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

  private makeFact(highlight: HighlightObject[], fact: TextaFact, loopIndex: number, originalText: string, colors: Map<string, string>)
    : number {
    let newText = '';
    for (let i = loopIndex; i <= originalText.length; i++) {
      // use closing span number, otherwise we would get no text, no nested facts
      if (fact.spans[1] === i) {
        highlight.push({text: newText, highlighted: true, fact, color: colors.get(fact.fact), id: this.id++});
        // - 1 because loop is escaped
        return i - 1;
      }
      newText += originalText.charAt(i);
    }
  }

  private removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  private detectOverlappingFacts(facts: TextaFact[]): Map<TextaFact, TextaFact[]> {
    let overLappingFacts: Map<TextaFact, TextaFact[]> = new Map<TextaFact, TextaFact[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
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

  private getFactByStartSpan(loopIndex: number, facts: TextaFact[]): TextaFact {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] === loopIndex) {
        return fact;
      }
    }
    return undefined;
  }

  private getFactWithStartSpanHigherThan(position: number, facts: TextaFact[]): number {
    for (const fact of facts) {
      if ((fact.spans as number[])[0] > position) {
        return fact.spans[0] as number;
      }
    }
    return 0;
  }

  private sortByStartLowestSpan(a, b) {
    if (a.spans[0] === b.spans[0]) {
      return (a.spans[1] < b.spans[1]) ? -1 : 1; // sort by last span instead (need this for nested facts order)
    } else {
      return (a.spans[0] < b.spans[0]) ? -1 : 1;
    }
  }


  generateRandomColors(numberOfRandomColors: number) {
    const output: string[] = [];
    const max = 0xfff;
    for (let i = 0; i < numberOfRandomColors; i++) {
      output.push('#' + (Math.round(Math.random() * (max - 0xf77)) + 0xf77).toString(16));
    }
    return output;
  }

  trackById(index, item) {
    return item.id;
  }
}

interface HighlightObject {
  id: number; // for trackBy
  text: string;
  highlighted: boolean;
  fact?: TextaFact;
  color?: string;
  nested?: HighlightObject;
}

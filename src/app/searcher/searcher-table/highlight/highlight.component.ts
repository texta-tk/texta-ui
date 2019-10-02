import {Component, Input, OnInit} from '@angular/core';


export interface TextaFact {
  doc_path: string;
  fact: string;
  spans: string | number[];
  str_val: string;
  id?: number;
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

  @Input() set JsonResponse(mlpData: any) {
    const currentFieldFacts = this.getFactsByField(mlpData, this.currentColumn);
    const colors = this.generateColorsForFacts(currentFieldFacts);
    this.highlightArray = this.makeHighLights(mlpData[this.currentColumn], currentFieldFacts, colors);
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
      (<number[]>fact.spans) = JSON.parse(<string>fact.spans).flat();
    });
    // need this sort for fact priority
    facts.sort(this.sortByStart);

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

  private makeFactNested(
    highlightArray: HighlightObject[],
    rootFact: TextaFact,
    overLappingFacts: Map<TextaFact, TextaFact[]>,
    loopIndex: number,
    originalText: string,
    colors: Map<string, string>): number {

    const nestedFacts: TextaFact[] = overLappingFacts.get(rootFact);
    // highest span value in nestedfacts
    const highestSpanValue = Math.max.apply(null, nestedFacts.map(function (o) {
      return Math.max.apply(Math, o.spans);
    }));

    let highlightObject: HighlightObject;
    let factText = '';
    let previousFact;

    for (let i = loopIndex; i <= originalText.length; i++) {

      let factCurrentIndex = nestedFacts.find(e => (e.spans[0] === i));
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
      // no more nested facts
      if (highestSpanValue === i) {
        if (factText !== '') {
          factCurrentIndex = nestedFacts.find(e => (e.spans[1] === i));
          highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, factCurrentIndex,
            colors.get(factCurrentIndex.fact),
            factText);
          factText = '';
        }
        // if the rootfact is still going on (meaning the last fact was actually in the middle of the root fact) then keep looping
        if (!(rootFact.spans[1] > i)) {
          // highlightarray is reference to outer scope, push and return new loop index
          highlightArray.push(highlightObject);
          // - 1 because loop is escaped
          return i - 1;
        }
      }
      // loop til you hit the end of the rootfact
      if (rootFact.spans[1] === i) {
        highlightObject = this.makeFactNestedHighlightRecursive(highlightObject, rootFact,
          colors.get(rootFact.fact),
          factText);
        // highlightarray is reference to outer scope, push and return new loop index
        highlightArray.push(highlightObject);
        // - 1 because loop is escaped
        return i - 1;
      }
      factText += originalText.charAt(i);
    }

    return loopIndex;
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

  private detectOverlappingFacts(facts: TextaFact[]): Map<TextaFact, TextaFact[]> {
    let overLappingFacts: Map<TextaFact, TextaFact[]> = new Map<TextaFact, TextaFact[]>();
    if (facts.length > 0) {
      facts[0].id = 0;
      overLappingFacts = this.detectOverLappingFactsDrill(facts[0], facts, 1, overLappingFacts);
    }
    return overLappingFacts;
  }

  private detectOverLappingFactsDrill(factRoot: TextaFact, facts: TextaFact[],
                                      index: number, nestedArray?: Map<TextaFact, TextaFact[]>): Map<TextaFact, TextaFact[]> {

    if (index < facts.length) {
      if (facts[index].spans[0] < factRoot.spans[1]) {
        // keep iterating with current fact till it finds one who isnt nested into this fact
        nestedArray.set(factRoot, nestedArray.has(factRoot) ? nestedArray.get(factRoot).concat(facts[index]) : [facts[index]]);
        return this.detectOverLappingFactsDrill(factRoot, facts, index + 1, nestedArray);
      }
      // this fact isnt nested, set it as new root fact and keep iterating
      // id to avoid identical fact objects
      const newRootFact = facts[index];
      newRootFact.id = index;
      return this.detectOverLappingFactsDrill(newRootFact, facts, index + 1, nestedArray);
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

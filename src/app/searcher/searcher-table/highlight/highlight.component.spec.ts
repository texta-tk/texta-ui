import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {HighlightComponent} from './highlight.component';
import {SharedModule} from '../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FactConstraint, FactTextInputGroup} from '../../searcher-sidebar/build-search/Constraints';
import {HighlightSettings} from '../../../shared/SettingVars';

describe('HighlightComponent', () => {
  let component: HighlightComponent;
  let fixture: ComponentFixture<HighlightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule, SharedModule
      ],
      declarations: [HighlightComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should highlight a single fact correctly', () => {
    const jsonData = {
      text: 'these are some words: John, nice Lenin, wow!', texta_facts: [
        {
          str_val: 'John',
          spans: '[[22, 26]]',
          fact: 'PER',
          doc_path: 'text'
        },
      ]
    };
    component.highlightConfig = {
      searcherHighlight: {},
      data: jsonData,
      highlightTextaFacts: true,
      highlightHyperlinks: true,
      currentColumn: 'text',
    };

    let johnHighlight;
    for (const element of component.highlightArray) {
      if (element.highlighted) {
        johnHighlight = element;
      }
    }
    fixture.detectChanges();
    expect(johnHighlight).toBeDefined();
    expect(johnHighlight?.text).toEqual('John');
  });
  it('should handle null undefined', () => {
    component.highlightConfig = {
      searcherHighlight: {},
      data: {text: undefined},
      highlightTextaFacts: true,
      highlightHyperlinks: true,
      currentColumn: 'text',
    };
    fixture.detectChanges();
    expect(component.highlightArray).toBeDefined();
    expect(component.highlightArray).toEqual([]);
  });
  it('should handle number', () => {
    component.highlightConfig = {
      searcherHighlight: {},
      data: {text: 1},
      highlightTextaFacts: true,
      highlightHyperlinks: true,
      currentColumn: 'text',
    };
    fixture.detectChanges();
    expect(component.highlightArray).toBeDefined();
    const val = component.highlightArray[0].text;
    expect(val).toEqual('1');
  });
  it('should highlight multiple non nested facts correctly', () => {
    const jsonData = {
      text: 'these are some words: John, nice Lenin, wow!', texta_facts: [
        {
          str_val: 'John',
          spans: '[[22, 26]]',
          fact: 'PER',
          doc_path: 'text'
        },
        {
          str_val: 'Lenin',
          spans: '[[33, 38]]',
          fact: 'PER',
          doc_path: 'text'
        },
      ]
    };

    component.highlightConfig = {
      searcherHighlight: {},
      data: jsonData,
      highlightTextaFacts: true,
      highlightHyperlinks: true,
      currentColumn: 'text',
    };
    console.log(component.highlightArray);
    const highlightedText: string[] = [];
    for (const element of component.highlightArray) {
      if (element.highlighted) {
        highlightedText.push(element.text);
      }
    }

    fixture.detectChanges();
    expect(highlightedText).toContain('John');

    expect(highlightedText).toContain('Lenin');
  });
  describe('tests with nested facts', () => {
    let jsonData: { text: string; texta_facts: { str_val: string; spans: string; fact: string; doc_path: string; }[]; };
    beforeEach(() => {
      jsonData = {
        text: 'these are some words: OÜ Hansa Medicalist, Eesti Energia Joonas xxxxxx', texta_facts: [
          {
            str_val: 'DOCUMENT WIDE FACT (TAG)',
            spans: '[[0, 0]]',
            fact: 'DOC WIDE TAG',
            doc_path: 'text'
          },
          {
            str_val: 'OÜ Hansa',
            spans: '[[22, 30]]',
            fact: 'ORG',
            doc_path: 'text'
          },
          {
            str_val: 'OÜ Hansa Medicalist',
            spans: '[[22, 41]]',
            fact: 'yes',
            doc_path: 'text'
          },

          {
            str_val: 'Eesti',
            spans: '[[43, 48]]',
            fact: 'LOC',
            doc_path: 'text'
          },
          {
            str_val: 'Eesti Energia',
            spans: '[[43, 56]]',
            fact: 'ORG',
            doc_path: 'text'
          },
          {
            str_val: 'Energia Joonas',
            spans: '[[49, 63]]',
            fact: 'PER',
            doc_path: 'text'
          },
        ]
      };
    });
    it('should highlight nested facts correctly', () => {

      component.highlightConfig = {
        searcherHighlight: {},
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }

      fixture.detectChanges();
      expect(highlightedText).toContain('OÜ Hansa');

      expect(highlightedText).toContain(' Medicalist');

      expect(highlightedText).toContain('Eesti');

      expect(highlightedText).toContain(' ');

      expect(highlightedText).toContain('Energia Joonas');
    });

    it('should highlight searcher terms in the middle of nested facts correctly', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these ${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG}re some words: OÜ H${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG}ns${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG} Medic${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG}list, Eesti Energi${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG} Joon${HighlightSettings.PRE_TAG}a${HighlightSettings.POST_TAG}s xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }

      fixture.detectChanges(); //  [ 'a', 'OÜ H', 'a', 'ns', 'a', ' Medic', 'a', 'list', 'Eesti', ' ', 'Energi', 'a', ' Joon', 'a', 's' ]
      expect(highlightedText).toEqual(['a', 'OÜ H', 'a', 'ns', 'a', ' Medic', 'a', 'list', 'Eesti', ' ', 'Energi', 'a', ' Joon', 'a', 's']);
    });

    it('should highlight searcher terms at the start of nested facts correctly', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: ${HighlightSettings.PRE_TAG}OÜ${HighlightSettings.POST_TAG} Hansa Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }

      fixture.detectChanges();
      expect(highlightedText).toEqual(['OÜ', ' Hansa', ' Medicalist', 'Eesti', ' ', 'Energia Joonas']);
    });
    it('should highlight searcher terms cutting into the start of a nested fact', () => {
      // 'ome words: OÜ H';
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are s${HighlightSettings.PRE_TAG}ome words: OÜ H${HighlightSettings.POST_TAG}ansa Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges();
      expect(highlightedText).toEqual(['ome words: OÜ H', 'ansa', ' Medicalist', 'Eesti', ' ', 'Energia Joonas']);
    });
    it('should highlight searcher terms overlapping the whole nestedfact', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`${HighlightSettings.PRE_TAG}these are some words: OÜ Hansa Medicalist, Ees${HighlightSettings.POST_TAG}ti Energia Joonas xxxxxx`]
        },
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        data: jsonData,
        currentColumn: 'text',
      };
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges();
      expect(highlightedText).toEqual(['these are some words: OÜ Hansa Medicalist, Ees', 'ti', ' ', 'Energia Joonas']);
    });

    it('should highlight searcher terms with starting point and end point exactly the same as a nestedfacts child', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: ${HighlightSettings.PRE_TAG}OÜ Hansa${HighlightSettings.POST_TAG} Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        data: jsonData,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges();
      expect(highlightedText).toEqual(['OÜ Hansa', ' Medicalist', 'Eesti', ' ', 'Energia Joonas']);
      // @ts-ignore
      expect(component.highlightArray[1].span.searcherHighlight).toBe(true);
    });
    it('should highlight searcher terms ending at the exact position of the last fact of a nestedfact', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa Medicalist, Eesti ${HighlightSettings.PRE_TAG}Energia Joonas${HighlightSettings.POST_TAG} xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges();
      expect(highlightedText).toEqual(['OÜ Hansa', ' Medicalist', 'Eesti', ' ', 'Energia Joonas']);
      // @ts-ignore
      expect(component.highlightArray[3].nested.nested.span.searcherHighlight).toBe(true);
    });
    it('should highlight searcher term at the exact position of a nestedfact', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: ${HighlightSettings.PRE_TAG}OÜ Hansa Medicalist${HighlightSettings.POST_TAG}, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?
      expect(highlightedText).toEqual(['', 'OÜ Hansa Medicalist', 'Eesti', ' ', 'Energia Joonas']);
      // @ts-ignore
      expect(component.highlightArray[1].nested.span.searcherHighlight).toBe(true);
    });
    it('should highlight searcher term cutting out of the nesterdfacts ending', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa Medicalist, Eesti Energia Joon${HighlightSettings.PRE_TAG}as xxx${HighlightSettings.POST_TAG}xxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?
      expect(highlightedText).toEqual(['OÜ Hansa', ' Medicalist', 'Eesti', ' ', 'Energia Joon', 'as xxx']);
      // expect(component.highlightArray[1].nested.fact.searcherHighlight).toBe(true);
    });
    it('should highlight searcher term ranging from the middle of 1 nestedfact to the middle of another one', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa M${HighlightSettings.PRE_TAG}edicalist, Eesti Ener${HighlightSettings.POST_TAG}gia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?
      // gia, joonas cause gia belongs to eesti energia so it also displays eesti energia fact not only energia joonas
      expect(highlightedText).toEqual(['OÜ Hansa', ' M', 'edicalist, Eesti Ener', 'gia', ' Joonas']);
      // expect(component.highlightArray[1].nested.fact.searcherHighlight).toBe(true);
    });
    it('should only highlight matching facts with matching options config', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
        onlyHighlightMatching: [new FactConstraint([{
          path: 'texta_facts',
          type: 'fact'
        }], 'must', 'PER', 'must')]
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?

      expect(highlightedText).toEqual(['Energia Joonas']);
      // expect(component.highlightArray[1].nested.fact.searcherHighlight).toBe(true);
    });

    it('should only highlight facts with matching fact value options config', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
        onlyHighlightMatching: [new FactConstraint([{
          path: 'texta_facts',
          type: 'fact'
        }], 'must', '', 'must', [new FactTextInputGroup('must', 'LOC', 'Eesti')])]
      };
      console.log(component.highlightArray);
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?

      expect(highlightedText).toEqual(['Eesti']);
      // expect(component.highlightArray[1].nested.fact.searcherHighlight).toBe(true);
    });

    it('should highlight searcher term when it starts at index 0 (same index as document wide fact)', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`${HighlightSettings.PRE_TAG}these${HighlightSettings.POST_TAG} are some words: OÜ Hansa Medicalist, Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        currentColumn: 'text',
      };
      const highlightedText: string[] = [];
      for (const element of component.highlightArray) {
        if (element.highlighted) {
          highlightedText.push(element.text);
          loopThroughNestedHighlightObject(element, highlightedText);
        }
      }
      fixture.detectChanges(); // todo clean up empty highlight when search term overwrites fact highlight?
      expect(highlightedText).toEqual(['these', 'OÜ Hansa', ' Medicalist', 'Eesti', ' ', 'Energia Joonas']);
      // @ts-ignore
      expect(component.highlightArray[1].span.searcherHighlight).toBe(true);
    });

    it('should show short version starting from the start', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some words: OÜ Hansa Medicalist, ${HighlightSettings.PRE_TAG}Eesti${HighlightSettings.POST_TAG} Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        showShortVersion: 3,
        currentColumn: 'text',
      };
      console.log(JSON.parse(JSON.stringify(component.highlightArray, replaceColor)));

      expect(JSON.stringify(component.highlightArray, replaceColor)).toEqual(`[{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":"... ","fullText":"... ","highlighted":false,"isVisible":true},{"text":" words: ","highlighted":false,"isVisible":true,"shortText":" words: ","fullText":"these are some words: "},{"text":"OÜ Hansa","highlighted":true,"span":{"str_val":"OÜ Hansa","spans":[22,30],"fact":"ORG","doc_path":"text","id":0},"nested":{"text":" Medicalist","highlighted":true,"span":{"str_val":"OÜ Hansa Medicalist","spans":[30,41],"fact":"yes","doc_path":"text"}},"isVisible":true,"shortText":"OÜ Hansa","fullText":"OÜ Hansa"},{"text":", ","highlighted":false,"isVisible":true,"shortText":", ","fullText":", "}]},"isVisible":false},{"text":"Eesti","highlighted":true,"span":{"doc_path":"text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[43,48],"str_val":"searcher highlight","id":2},"nested":{"text":" ","highlighted":true,"span":{"str_val":"Eesti Energia","spans":[48,56],"fact":"ORG","doc_path":"text"},"nested":{"text":"Energia Joonas","highlighted":true,"span":{"str_val":"Energia Joonas","spans":[49,63],"fact":"PER","doc_path":"text"}}}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" xxxxxx","highlighted":false,"isVisible":true,"shortText":" xxxxxx","fullText":" xxxxxx"}]},"isVisible":false}]`);
      fixture.detectChanges();
    });
    it('should show short version starting from the end', () => {
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these ${HighlightSettings.PRE_TAG}are${HighlightSettings.POST_TAG} some words: OÜ Hansa Medicalist,Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        showShortVersion: 3,
        currentColumn: 'text',
      };
      console.log(JSON.parse(JSON.stringify(component.highlightArray, replaceColor)));

      expect(JSON.stringify(component.highlightArray, replaceColor)).toEqual(`[{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":"these ","highlighted":false,"isVisible":true,"shortText":"these ","fullText":"these "}]},"isVisible":false},{"text":"are","highlighted":true,"span":{"doc_path":"text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[6,9],"str_val":"searcher highlight","id":0}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" some words: ","highlighted":false,"isVisible":true,"shortText":" some words: ","fullText":" some words: "},{"text":"OÜ ","highlighted":true,"span":{"str_val":"OÜ Hansa","spans":[22,30],"fact":"ORG","doc_path":"text","id":1},"nested":{"text":" Medicalist","highlighted":true,"span":{"str_val":"OÜ Hansa Medicalist","spans":[30,41],"fact":"yes","doc_path":"text"}},"isVisible":true,"shortText":"OÜ ","fullText":"OÜ Hansa"},{"text":" ...","fullText":" ...","highlighted":false,"isVisible":true},{"text":", ","highlighted":false},{"text":"Eesti","highlighted":true,"span":{"str_val":"Eesti","spans":[43,48],"fact":"LOC","doc_path":"text","id":3},"nested":{"text":" ","highlighted":true,"span":{"str_val":"Eesti Energia","spans":[48,56],"fact":"ORG","doc_path":"text"},"nested":{"text":"Energia Joonas","highlighted":true,"span":{"str_val":"Energia Joonas","spans":[49,63],"fact":"PER","doc_path":"text"}}}},{"text":" xxxxxx","highlighted":false}]},"isVisible":false}]`);
      fixture.detectChanges();
    });
    it('should show short version from middle', () => {
      // entire nested fact should count as 1 word?
      component.highlightConfig = {
        searcherHighlight: {
          text:
            [`these are some ${HighlightSettings.PRE_TAG}words:${HighlightSettings.POST_TAG} OÜ Hansa Medicalist,Eesti Energia Joonas xxxxxx`]
        },
        data: jsonData,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        showShortVersion: 1,
        currentColumn: 'text',
      };
      console.log(JSON.parse(JSON.stringify(component.highlightArray, replaceColor)));

      expect(JSON.stringify(component.highlightArray, replaceColor)).toEqual(`[{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":"... ","fullText":"... ","highlighted":false,"isVisible":true},{"text":" some ","highlighted":false,"isVisible":true,"shortText":" some ","fullText":"these are some "}]},"isVisible":false},{"text":"words:","highlighted":true,"span":{"doc_path":"text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[15,21],"str_val":"searcher highlight","id":0}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" ","highlighted":false,"isVisible":true,"shortText":" ","fullText":" "},{"text":"OÜ ","highlighted":true,"span":{"str_val":"OÜ Hansa","spans":[22,30],"fact":"ORG","doc_path":"text","id":1},"nested":{"text":" Medicalist","highlighted":true,"span":{"str_val":"OÜ Hansa Medicalist","spans":[30,41],"fact":"yes","doc_path":"text"}},"isVisible":true,"shortText":"OÜ ","fullText":"OÜ Hansa"},{"text":" ...","fullText":" ...","highlighted":false,"isVisible":true},{"text":", ","highlighted":false},{"text":"Eesti","highlighted":true,"span":{"str_val":"Eesti","spans":[43,48],"fact":"LOC","doc_path":"text","id":3},"nested":{"text":" ","highlighted":true,"span":{"str_val":"Eesti Energia","spans":[48,56],"fact":"ORG","doc_path":"text"},"nested":{"text":"Energia Joonas","highlighted":true,"span":{"str_val":"Energia Joonas","spans":[49,63],"fact":"PER","doc_path":"text"}}}},{"text":" xxxxxx","highlighted":false}]},"isVisible":false}]`);
      fixture.detectChanges();
    });
    it('should show short version overall test', () => {
      // entire nested fact should count as 1 word?
      const dataJ = {
        texta_facts: JSON.parse('[{"str_val":"Põhjasõjas","spans":"[[1057, 1067]]","fact":"ORG","doc_path":"ArticleBody_mlp.text"},{"str_val":"Victoria","spans":"[[151, 159]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Daniel","spans":"[[184, 190]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Oscar Carl Olof","spans":"[[234, 249]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Victoria","spans":"[[405, 413]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Daniel","spans":"[[417, 424]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Bernadotte ’ i","spans":"[[478, 492]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Oscar I","spans":"[[550, 557]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Oscar II","spans":"[[583, 591]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl XVI Gustaf","spans":"[[632, 648]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Oscar","spans":"[[685, 690]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl","spans":"[[730, 734]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"CarlXVI Gustaf","spans":"[[779, 793]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl Philip","spans":"[[802, 813]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Bernadotte ’ i","spans":"[[816, 830]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Karl XIV Johan","spans":"[[866, 880]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Karl XV","spans":"[[906, 913]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Vägev","spans":"[[938, 952]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Karl XI","spans":"[[1046, 1053]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Karl XII","spans":"[[1106, 1114]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl","spans":"[[1122, 1126]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl XVI Gustaf","spans":"[[1133, 1149]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Désiréel","spans":"[[1179, 1187]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl","spans":"[[1196, 1200]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Carl Christian","spans":"[[1224, 1238]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Olof","spans":"[[1246, 1250]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Daniel","spans":"[[1314, 1321]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Olof","spans":"[[1339, 1343]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Olleks","spans":"[[1367, 1373]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Olof Skötkonung","spans":"[[1433, 1448]]","fact":"PER","doc_path":"ArticleBody_mlp.text"},{"str_val":"Rootsi","spans":"[[129, 135]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Rootsi","spans":"[[460, 467]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Christina","spans":"[[662, 671]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Rootsi riik","spans":"[[956, 968]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Eesti","spans":"[[1003, 1009]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Narva","spans":"[[1068, 1073]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Vene","spans":"[[1083, 1087]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"},{"str_val":"Rootsi","spans":"[[1376, 1383]]","fact":"LOC","doc_path":"ArticleBody_mlp.text"}]'),
        'ArticleBody_mlp.text': 'Noored vanemad murravad kõvasti pead , et oma võsukesele sobiv nimi leida . Sinivereliste laste puhul on asi veelgi keerulisem . Rootsi kroonprintsess Victoria ja tema abikaasa prints Daniel andsid oma vastsündinud maimukesele nimeks Oscar Carl Olof . Käbedad rootslased on juba välja uurinud , et täpselt samasugust kolmest nimest koosnev kombinatsioon on passis veel 15 rootsi mehel . Kõik kolm nime on Victoria ja Danieli jaoks olulise tähendusega . Praegu Rootsit valitseva Bernadotte ´ i suguvõsa hulgas on olnud kaks Oscari-nimelist kuningat . Oscar I oli troonil 1844–1859 ja Oscar II aastatel 1872–1907. Ka praeguse kuninga Carl XVI Gustafi õe printsess Christina poja nimi on Oscar . Nii tulebki sisse teine oluline nimi Carl , mida kannavad nii väikese printsi vanaisa CarlXVI Gustaf kui onu Carl Philip . Bernadotte ´ i dünastia valitsejate seas on olnud Karl XIV Johan ( troonil 1818–1844 ) ja Karl XV ( valitses 1859–1872 ). Vägevad Karlid on Rootsi riiki valitsenud varemgi . Kes ei teaks Eestis 17. sajandil maareformi korraldanud Karl XI ja Põhjasõjas Narva lahingus Vene vägesid nahutanud Karl XII nime ? Carl on ka Carl XVI Gustafi kahe õepoja nimi . Printsess Désiréel on poeg Carl ja printsess Birgittal Carl Christian . Nimi Olof tuleb isapoolsest suguvõsast . Tavakodanike seast pärit prints Danieli keskmine nimi on Olof ja ka tema isa kutsuti Olleks . Rootsil on varem olnud ka sellenimeline muinaskuningas . Olof Skötkonung valitses aastatel 995-1022.',
      };
      component.highlightConfig = {
        searcherHighlight: {
          'ArticleBody_mlp.text':
            [`${HighlightSettings.PRE_TAG}Noored${HighlightSettings.POST_TAG} ${HighlightSettings.PRE_TAG}vanemad${HighlightSettings.POST_TAG} murravad kõvasti pead , et oma võsukesele sobiv nimi leida . Sinivereliste laste puhul on asi veelgi keerulisem . Rootsi kroonprintsess Victoria ja tema abikaasa prints Daniel andsid oma vastsündinud maimukesele nimeks Oscar Carl Olof . Käbedad rootslased on juba välja uurinud , et täpselt samasugust kolmest nimest koosnev kombinatsioon on passis veel 15 rootsi mehel . Kõik kolm nime on Victoria ja Danieli jaoks olulise tähendusega . Praegu Rootsit valitseva Bernadotte ´ i ${HighlightSettings.PRE_TAG}suguvõsa${HighlightSettings.POST_TAG} hulgas on olnud kaks Oscari-nimelist ${HighlightSettings.PRE_TAG}kuningat${HighlightSettings.POST_TAG} . Oscar I oli troonil 1844–1859 ja Oscar II aastatel 1872–1907. Ka praeguse ${HighlightSettings.PRE_TAG}kuninga${HighlightSettings.POST_TAG} Carl XVI Gustafi õe printsess Christina poja nimi on Oscar . Nii tulebki sisse teine oluline nimi Carl , mida kannavad nii väikese printsi vanaisa CarlXVI Gustaf kui onu Carl Philip . Bernadotte ´ i dünastia valitsejate seas on olnud Karl ${HighlightSettings.PRE_TAG}XIV${HighlightSettings.POST_TAG} Johan ( troonil 1818–1844 ) ja Karl XV ( valitses 1859–1872 ). Vägevad Karlid on Rootsi riiki valitsenud varemgi . Kes ei teaks Eestis 17. sajandil maareformi korraldanud Karl ${HighlightSettings.PRE_TAG}XI${HighlightSettings.POST_TAG} ja Põhjasõjas Narva lahingus Vene vägesid nahutanud Karl ${HighlightSettings.PRE_TAG}XII${HighlightSettings.POST_TAG} nime ? Carl on ka Carl XVI Gustafi kahe õepoja nimi . Printsess Désiréel on poeg Carl ja printsess Birgittal Carl Christian . Nimi Olof tuleb isapoolsest ${HighlightSettings.PRE_TAG}suguvõsast${HighlightSettings.POST_TAG} . Tavakodanike seast pärit prints Danieli keskmine nimi on Olof ja ka tema isa kutsuti Olleks . Rootsil on varem olnud ka sellenimeline muinaskuningas . Olof Skötkonung valitses aastatel 995-1022.`]
        },
        data: dataJ,
        highlightTextaFacts: true,
        highlightHyperlinks: true,
        showShortVersion: 3,
        currentColumn: 'ArticleBody_mlp.text',
      };
      console.log(JSON.parse(JSON.stringify(component.highlightArray, replaceColor)));

      expect(JSON.stringify(component.highlightArray, replaceColor)).toEqual(`[{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":"","highlighted":false,"isVisible":true,"shortText":"","fullText":""}]},"isVisible":false},{"text":"Noored","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[0,6],"str_val":"searcher highlight","id":0}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" ","highlighted":false,"shortText":" ","isVisible":true}]},"isVisible":false},{"text":"vanemad","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[7,14],"str_val":"searcher highlight","id":1}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" murravad kõvasti pead ","highlighted":false,"isVisible":true,"shortText":" murravad kõvasti pead ","fullText":" murravad kõvasti pead , et oma võsukesele sobiv nimi leida . Sinivereliste laste puhul on asi veelgi keerulisem . "},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":"Rootsi","highlighted":true,"span":{"str_val":"Rootsi","spans":[129,135],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":2}},{"text":" kroonprintsess ","highlighted":false},{"text":"Victoria","highlighted":true,"span":{"str_val":"Victoria","spans":[151,159],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":3}},{"text":" ja tema abikaasa prints ","highlighted":false},{"text":"Daniel","highlighted":true,"span":{"str_val":"Daniel","spans":[184,190],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":4}},{"text":" andsid oma vastsündinud maimukesele nimeks ","highlighted":false},{"text":"Oscar Carl Olof","highlighted":true,"span":{"str_val":"Oscar Carl Olof","spans":[234,249],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":5}},{"text":" . Käbedad rootslased on juba välja uurinud , et täpselt samasugust kolmest nimest koosnev kombinatsioon on passis veel 15 rootsi mehel . Kõik kolm nime on ","highlighted":false},{"text":"Victoria","highlighted":true,"span":{"str_val":"Victoria","spans":[405,413],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":6}},{"text":" ja ","highlighted":false},{"text":"Danieli","highlighted":true,"span":{"str_val":"Daniel","spans":[417,424],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":7}},{"text":" jaoks olulise tähendusega . Praegu ","highlighted":false},{"text":"Rootsit","highlighted":true,"span":{"str_val":"Rootsi","spans":[460,467],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":8}},{"text":" valitseva ","highlighted":false,"isVisible":true,"shortText":" valitseva ","fullText":" valitseva "},{"text":"Bernadotte ´ i","highlighted":true,"span":{"str_val":"Bernadotte ’ i","spans":[478,492],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":9},"isVisible":true,"shortText":"Bernadotte ´ i","fullText":"Bernadotte ´ i"},{"text":" ","highlighted":false,"isVisible":true,"shortText":" "}]},"isVisible":false},{"text":"suguvõsa","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[493,501],"str_val":"searcher highlight","id":10}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" hulgas on olnud kaks Oscari-nimelist ","highlighted":false,"shortText":" hulgas on olnud kaks Oscari-nimelist ","isVisible":true}]},"isVisible":false},{"text":"kuningat","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[539,547],"str_val":"searcher highlight","id":11}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" . ","highlighted":false,"isVisible":true,"shortText":" . ","fullText":" . "},{"text":"Oscar I","highlighted":true,"span":{"str_val":"Oscar I","spans":[550,557],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":12},"isVisible":true,"shortText":"Oscar I","fullText":"Oscar I"},{"text":" oli ","highlighted":false,"isVisible":true,"shortText":" oli ","fullText":" oli troonil 1844–1859 ja "},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":"Oscar II","highlighted":true,"span":{"str_val":"Oscar II","spans":[583,591],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":13}},{"text":" 1872–1907. Ka praeguse ","highlighted":false,"isVisible":true,"shortText":" 1872–1907. Ka praeguse ","fullText":" aastatel 1872–1907. Ka praeguse "}]},"isVisible":false},{"text":"kuninga","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[624,631],"str_val":"searcher highlight","id":14}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" ","highlighted":false,"isVisible":true,"shortText":" ","fullText":" "},{"text":"Carl XVI Gustafi","highlighted":true,"span":{"str_val":"Carl XVI Gustaf","spans":[632,648],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":15},"isVisible":true,"shortText":"Carl XVI Gustafi","fullText":"Carl XVI Gustafi"},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":" õe printsess ","highlighted":false},{"text":"Christina","highlighted":true,"span":{"str_val":"Christina","spans":[662,671],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":16}},{"text":" poja nimi on ","highlighted":false},{"text":"Oscar","highlighted":true,"span":{"str_val":"Oscar","spans":[685,690],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":17}},{"text":" . Nii tulebki sisse teine oluline nimi ","highlighted":false},{"text":"Carl","highlighted":true,"span":{"str_val":"Carl","spans":[730,734],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":18}},{"text":" , mida kannavad nii väikese printsi vanaisa ","highlighted":false},{"text":"CarlXVI Gustaf","highlighted":true,"span":{"str_val":"CarlXVI Gustaf","spans":[779,793],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":19}},{"text":" kui onu ","highlighted":false},{"text":"Carl Philip","highlighted":true,"span":{"str_val":"Carl Philip","spans":[802,813],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":20}},{"text":" . ","highlighted":false},{"text":"Bernadotte ´ i","highlighted":true,"span":{"str_val":"Bernadotte ’ i","spans":[816,830],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":21}},{"text":" seas on olnud ","highlighted":false,"isVisible":true,"shortText":" seas on olnud ","fullText":" dünastia valitsejate seas on olnud "}]},"isVisible":false},{"text":"Karl ","highlighted":true,"span":{"str_val":"Karl XIV Johan","spans":[866,880],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":22},"nested":{"text":"XIV","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[871,874],"str_val":"searcher highlight"},"nested":{"text":" Johan","highlighted":true,"span":{"str_val":"Karl XIV Johan","spans":[866,880],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":22}}}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" ( troonil 1818–1844 ) ja ","highlighted":false,"isVisible":true,"shortText":" ( troonil 1818–1844 ) ja ","fullText":" ( troonil 1818–1844 ) ja "},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":"Karl XV","highlighted":true,"span":{"str_val":"Karl XV","spans":[906,913],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":24}},{"text":" ( valitses 1859–1872 ). ","highlighted":false},{"text":"Vägevad Karlid","highlighted":true,"span":{"str_val":"Vägev","spans":[938,952],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":25}},{"text":" on ","highlighted":false},{"text":"Rootsi riiki","highlighted":true,"span":{"str_val":"Rootsi riik","spans":[956,968],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":26}},{"text":" valitsenud varemgi . Kes ei teaks ","highlighted":false},{"text":"Eestis","highlighted":true,"span":{"str_val":"Eesti","spans":[1003,1009],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":27}},{"text":" sajandil maareformi korraldanud ","highlighted":false,"isVisible":true,"shortText":" sajandil maareformi korraldanud ","fullText":" 17. sajandil maareformi korraldanud "}]},"isVisible":false},{"text":"Karl ","highlighted":true,"span":{"str_val":"Karl XI","spans":[1046,1053],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":28},"nested":{"text":"XI","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[1051,1053],"str_val":"searcher highlight"}}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" ja ","highlighted":false,"isVisible":true,"shortText":" ja ","fullText":" ja "},{"text":"Põhjasõjas","highlighted":true,"span":{"str_val":"Põhjasõjas","spans":[1057,1067],"fact":"ORG","doc_path":"ArticleBody_mlp.text","id":30},"isVisible":true,"shortText":"Põhjasõjas","fullText":"Põhjasõjas"},{"text":" ","highlighted":false,"isVisible":true,"shortText":" ","fullText":" "},{"text":"Narva","highlighted":true,"span":{"str_val":"Narva","spans":[1068,1073],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":31},"isVisible":true,"shortText":"Narva","fullText":"Narva"},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":" lahingus ","highlighted":false},{"text":"Vene","highlighted":true,"span":{"str_val":"Vene","spans":[1083,1087],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":32},"isVisible":true,"shortText":"Vene","fullText":"Vene"},{"text":" vägesid nahutanud ","highlighted":false,"isVisible":true,"shortText":" vägesid nahutanud ","fullText":" vägesid nahutanud "}]},"isVisible":false},{"text":"Karl ","highlighted":true,"span":{"str_val":"Karl XII","spans":[1106,1114],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":33},"nested":{"text":"XII","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[1111,1114],"str_val":"searcher highlight"}}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" nime ? ","highlighted":false,"isVisible":true,"shortText":" nime ? ","fullText":" nime ? "},{"text":"Carl","highlighted":true,"span":{"str_val":"Carl","spans":[1122,1126],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":35},"isVisible":true,"shortText":"Carl","fullText":"Carl"},{"text":" on ","highlighted":false,"isVisible":true,"shortText":" on ","fullText":" on ka "},{"text":" ... \\n","fullText":" ... \\n","highlighted":false,"isVisible":true},{"text":"Carl XVI Gustafi","highlighted":true,"span":{"str_val":"Carl XVI Gustaf","spans":[1133,1149],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":36}},{"text":" kahe õepoja nimi . Printsess ","highlighted":false},{"text":"Désiréel","highlighted":true,"span":{"str_val":"Désiréel","spans":[1179,1187],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":37}},{"text":" on poeg ","highlighted":false},{"text":"Carl","highlighted":true,"span":{"str_val":"Carl","spans":[1196,1200],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":38}},{"text":" ja printsess Birgittal ","highlighted":false},{"text":"Carl Christian","highlighted":true,"span":{"str_val":"Carl Christian","spans":[1224,1238],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":39}},{"text":" . Nimi ","highlighted":false},{"text":"Olof","highlighted":true,"span":{"str_val":"Olof","spans":[1246,1250],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":40},"isVisible":true,"shortText":"Olof","fullText":"Olof"},{"text":" tuleb isapoolsest ","highlighted":false,"isVisible":true,"shortText":" tuleb isapoolsest ","fullText":" tuleb isapoolsest "}]},"isVisible":false},{"text":"suguvõsast","highlighted":true,"span":{"doc_path":"ArticleBody_mlp.text","fact":"","sent_index":0,"searcherHighlight":true,"spans":[1269,1279],"str_val":"searcher highlight","id":41}},{"text":"","highlighted":false,"shortVersion":{"spans":[{"text":" . Tavakodanike seast pärit ","highlighted":false,"isVisible":true,"shortText":" . Tavakodanike seast pärit ","fullText":" . Tavakodanike seast pärit prints "},{"text":" ...","fullText":" ...","highlighted":false,"isVisible":true},{"text":"Danieli","highlighted":true,"span":{"str_val":"Daniel","spans":[1314,1321],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":42}},{"text":" keskmine nimi on ","highlighted":false},{"text":"Olof","highlighted":true,"span":{"str_val":"Olof","spans":[1339,1343],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":43}},{"text":" ja ka tema isa kutsuti ","highlighted":false},{"text":"Olleks","highlighted":true,"span":{"str_val":"Olleks","spans":[1367,1373],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":44}},{"text":" . ","highlighted":false},{"text":"Rootsil","highlighted":true,"span":{"str_val":"Rootsi","spans":[1376,1383],"fact":"LOC","doc_path":"ArticleBody_mlp.text","id":45}},{"text":" on varem olnud ka sellenimeline muinaskuningas . ","highlighted":false},{"text":"Olof Skötkonung","highlighted":true,"span":{"str_val":"Olof Skötkonung","spans":[1433,1448],"fact":"PER","doc_path":"ArticleBody_mlp.text","id":46}},{"text":" valitses aastatel 995-1022.","highlighted":false}]},"isVisible":false}]`);
      fixture.detectChanges();
    });
  });


});

// tslint:disable-next-line:typedef
function replaceColor(key: string, value: unknown) {
  // Filtering out properties
  if (key === 'color') {
    return undefined;
  }
  return value;
}

// tslint:disable-next-line:no-any
function loopThroughNestedHighlightObject(object: any, array: string[]): void {
  if (object.nested) {
    array.push(object.nested.text);
    loopThroughNestedHighlightObject(object.nested, array);
  }
}

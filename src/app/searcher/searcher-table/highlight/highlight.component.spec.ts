import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HighlightComponent} from './highlight.component';
import {SharedModule} from '../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('HighlightComponent', () => {
  let component: HighlightComponent;
  let fixture: ComponentFixture<HighlightComponent>;

  beforeEach(async(() => {
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
    component.currentColumn = 'text';
    component.searchTerm = 'tere';
    component.JsonResponse = jsonData;
    console.log(component.highlightArray);
    let johnHighlight;
    for (const element of component.highlightArray) {
      if (element.highlighted) {
        johnHighlight = element;
      }
    }
    fixture.detectChanges();
    expect(johnHighlight).toBeDefined();
    expect(johnHighlight.text).toEqual('John');
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
    component.currentColumn = 'text';
    component.searchTerm = 'tere';
    component.JsonResponse = jsonData;
    console.log(component.highlightArray);
    const highlightedText = [];
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
    let jsonData;
    beforeEach(() => {
      jsonData = {
        text: 'these are some words: OÜ Hansa Medicalist, Eesti Energia Joonas xxxxxx', texta_facts: [
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
      component.currentColumn = 'text';
      component.searchTerm = 'tere';
      component.JsonResponse = jsonData;
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

      component.currentColumn = 'text';
      component.searchTerm = 'a';
      component.JsonResponse = jsonData;
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
      component.currentColumn = 'text';
      component.searchTerm = 'OÜ';
      component.JsonResponse = jsonData;
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
      component.currentColumn = 'text';
      component.searchTerm = 'ome words: OÜ H';
      component.JsonResponse = jsonData;
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
      component.currentColumn = 'text';
      component.searchTerm = 'these are some words: OÜ Hansa Medicalist, Ees';
      component.JsonResponse = jsonData;
      console.log(component.highlightArray);
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
      component.currentColumn = 'text';
      component.searchTerm = 'OÜ Hansa';
      component.JsonResponse = jsonData;
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
      expect(component.highlightArray[1].fact.searcherHighlight).toBe(true);
    });
    it('should highlight searcher terms ending at the exact position of the last fact of a nestedfact', () => {
      component.currentColumn = 'text';
      component.searchTerm = 'Energia Joonas';
      component.JsonResponse = jsonData;
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
      expect(component.highlightArray[3].nested.nested.fact.searcherHighlight).toBe(true);
    });
    it('should highlight searcher term at the exact position of a nestedfact', () => {
      component.currentColumn = 'text';
      component.searchTerm = 'OÜ Hansa Medicalist';
      component.JsonResponse = jsonData;
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
      expect(component.highlightArray[1].nested.fact.searcherHighlight).toBe(true);
    });
    it('should highlight searcher term cutting out of the nesterdfacts ending', () => {
      component.currentColumn = 'text';
      component.searchTerm = 'as xxx';
      component.JsonResponse = jsonData;
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
      component.currentColumn = 'text';
      component.searchTerm = 'edicalist, Eesti Ener';
      component.JsonResponse = jsonData;
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
  });


});

function loopThroughNestedHighlightObject(object: any, array: string[]) {
  if (object.nested) {
    array.push(object.nested.text);
    loopThroughNestedHighlightObject(object.nested, array);
  }
}
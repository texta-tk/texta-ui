import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnInit,
  Output,
  EventEmitter
} from '@angular/core';
import {
  GenericHighlighterComponent,
  HighlightSpan,
} from '../generic-highlighter/generic-highlighter.component';
import {LegibleColor, UtilityFunctions} from '../../UtilityFunctions';

@Component({
  selector: 'app-texta-facts-chips',
  templateUrl: './texta-facts-chips.component.html',
  styleUrls: ['./texta-facts-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextaFactsChipsComponent implements OnInit {
  readonly NUMBER_OF_CHIPS_TO_DISPLAY = 25;
  factList: { factName: string, showing: boolean, factValues: { key: string, count: number }[], color: LegibleColor }[] = [];
  @Output() factValueClick = new EventEmitter<{ factName: string, factValue: string }>();
  @Output() factNameClick = new EventEmitter<string>();
  @Input() factNameHover = 'add constraint';

  constructor(private changeDetectorRef: ChangeDetectorRef,
              private ngZone: NgZone) {
  }

  @Input() set facts(facts: HighlightSpan[]) {
    this.ngZone.runOutsideAngular(() => {
      this.buildChipList(facts, () => this.ngZone.run(() => this.changeDetectorRef.markForCheck()));
    });
  }

  ngOnInit(): void {
  }

  buildFactValSearch(factName: string, factValue: string): void {
    this.factValueClick.emit({factName, factValue});
  }

  buildFactNameSearch(fact: string): void {
    this.factNameClick.emit(fact);
  }

  buildChipList(facts: { fact: string, str_val: string }[], doneCallback: () => void): void {
    setTimeout(() => {
      const colors = UtilityFunctions.generateColorsForFacts(facts);
      facts.forEach(val => {
        const obj = this.factList.find(x => x.factName === val.fact);
        if (obj && obj.factValues) {
          const factValue = obj.factValues.find(x => x.key === val.str_val);
          if (factValue) {
            factValue.count += 1;
          } else {
            obj.factValues.push({key: val.str_val, count: 1});
          }
        } else {
          this.factList.push({
            showing: false,
            factName: val.fact, factValues: [{key: val.str_val, count: 1}],
            color: colors.get(val.fact) || {backgroundColor: 'black', textColor: 'white'}
          });
        }
      });
      for (const factNameGroup of this.factList) {
        factNameGroup.factValues.sort((a, b) => b.count - a.count);
      }
      doneCallback();
    }, 1);
  }

}

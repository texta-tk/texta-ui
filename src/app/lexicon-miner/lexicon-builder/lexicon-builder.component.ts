import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Lexicon} from '../../shared/types/Lexicon';
import {LexiconService} from '../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../core/projects/project.store';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../../shared/types/tasks/Embedding';
import {LogService} from '../../core/util/log.service';
import {MatListOption} from '@angular/material';

@Component({
  selector: 'app-lexicon-builder',
  templateUrl: './lexicon-builder.component.html',
  styleUrls: ['./lexicon-builder.component.scss']
})
export class LexiconBuilderComponent implements OnInit, OnDestroy {
  _lexicon: Lexicon;
  positives: string;
  predictions: any[] = [];
  negatives: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  embeddings: Embedding[];
  selectedEmbedding: Embedding;

  @Input() set lexicon(value: Lexicon) {
    if (value) {
      this._lexicon = value;
      this.positives = this.stringListToString(value.phrases_parsed);
      this.predictions = [];
      // todo temp values
      /*this._lexicon.discarded_phrases_parsed = ['tere', 'hey', 'vangla'];
      this._lexicon.discarded_phrases_parsed.map(x => this.negatives.push({phrase: x}));*/
    } else {
      this._lexicon = null;
      this.predictions = [];
      this.positives = '';
      this.selectedEmbedding = null;
      this.negatives = [];
    }
  }

  constructor(private logService: LogService,
              private lexiconService: LexiconService, private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingService.getEmbeddings(currentProject.id);
      }
      return of(null);
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          this.embeddings = resp;
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getNewSuggestions(value: MatListOption[]) {

    this.updateLexicon(value);

    this.projectStore.getCurrentProject().pipe(take(1), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingService.predict({
          positives: this.newLineStringToList(this.positives),
          negatives: this.negatives.map(y => y.phrase)
        }, currentProject.id, this.selectedEmbedding.id);
      }
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          this.predictions = resp;
          if (this.predictions.length === 0) {
            this.logService.snackBarMessage('No words found', 5000);
          }
        }
      }
    });
  }

  saveLexicon() {
    const requestBody = {
      description: this._lexicon.description,
      phrases: this.newLineStringToList(this.positives),
      negative_phrases: this.negatives.map(y => y.phrase),
    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.lexiconService.updateLexicon(requestBody, currentProject.id, this._lexicon.id);
      }
      return of(null);
    })).subscribe((x: any) => {
      console.log(x);
    });
  }

  updateLexicon(value: MatListOption[]) {
    console.log(value);
    value.map((item: any) => {
      // remove selected item from predictions list
      this.predictions = this.predictions.filter((x: any) => {
        return x.phrase !== item.value.phrase;
      });
      return this.positives += this.positives.endsWith('\n') ? item.value.phrase + '\n' : '\n' + item.value.phrase;
    });
    // predictions filtered out to only contain negatives
    this.negatives = [...this.negatives, ...this.predictions];
    // update lexicon object so when changing lexicons it saves state
    this._lexicon.discarded_phrases_parsed = this.negatives.map(y => y.phrase);
    this._lexicon.phrases_parsed = this.newLineStringToList(this.positives);
  }

  stringListToString(stringList: string[]): string {

    let returnStr = '';
    if (stringList) {
      stringList.forEach(x => {
        returnStr += x + '\n';
      });
    }
    return returnStr;
  }

  newLineStringToList(stringWithNewLines: string): string[] {
    const stringList = stringWithNewLines.split('\n');
    // filter out empty values
    return stringList.filter(x => x !== '');
  }
}

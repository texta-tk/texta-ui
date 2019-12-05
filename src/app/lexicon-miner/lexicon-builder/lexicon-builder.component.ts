import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Lexicon} from '../../shared/types/Lexicon';
import {LexiconService} from '../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../core/projects/project.store';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding, EmbeddingPrediction} from '../../shared/types/tasks/Embedding';
import {LogService} from '../../core/util/log.service';
import {LocalStorageService} from 'src/app/core/util/local-storage.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-lexicon-builder',
  templateUrl: './lexicon-builder.component.html',
  styleUrls: ['./lexicon-builder.component.scss']
})
export class LexiconBuilderComponent implements OnInit, OnDestroy {
  outputSize = 20;
  _lexicon: Lexicon;
  positives: string;
  predictions: EmbeddingPrediction[] = [];
  negatives: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  embeddings: Embedding[];
  selectedEmbedding: Embedding;

  @Input() set lexicon(value: Lexicon) {
    if (value) {
      this._lexicon = value;
      this.positives = this.stringListToString(value.phrases);
      this.predictions = [];
      this.negatives = value.discarded_phrases;
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
              private lexiconService: LexiconService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore,
              private localStorageService: LocalStorageService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingService.getEmbeddings(currentProject.id);
      }
      return of(null);
    })).subscribe((resp: { count: number, results: Embedding[] } | HttpErrorResponse) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          this.embeddings = resp.results.filter((embedding: Embedding) => {
            return embedding.task.status === 'completed';
          });

          this.getSavedDefaultEmbedding();
        }
      }
    });
  }

  getSavedDefaultEmbedding() {
    const defaultEmbeddingId = this.localStorageService.getLexiconMinerEmbeddingId();
    if (defaultEmbeddingId) {
      this.embeddings.forEach((embedding: Embedding) => {
        if (defaultEmbeddingId && defaultEmbeddingId === embedding.id) {
          this.selectedEmbedding = embedding;
        }
      });
    }
    if (!defaultEmbeddingId || !this.selectedEmbedding) {
      this.localStorageService.deleteLexiconMinerEmbeddingId();
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getNewSuggestions() {
    // predictions filtered out to only contain negatives
    this.negatives = [...this.negatives, ...this.predictions];
    // update lexicon object so when changing lexicons it saves state
    this._lexicon.discarded_phrases = this.negatives.map(y => {
      if (y.hasOwnProperty('phrase')) {
        return y.phrase;
      }
      return y;
    });
    this._lexicon.phrases = this.newLineStringToList(this.positives);
    this.projectStore.getCurrentProject().pipe(take(1), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingService.predict({
          positives: this._lexicon.phrases,
          negatives: this._lexicon.discarded_phrases,
          output_size: this.outputSize,
        }, currentProject.id, this.selectedEmbedding.id);
      }
    })).subscribe((resp: EmbeddingPrediction[] | HttpErrorResponse) => {
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
      phrases: this._lexicon.phrases,
      discarded_phrases: this._lexicon.discarded_phrases
    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.lexiconService.updateLexicon(requestBody, currentProject.id, this._lexicon.id);
      }
      return of(null);
    })).subscribe((resp: Lexicon | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage('Lexicon saved', 3000);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarMessage('There was an error saving the lexicon', 3000);
      }
    });
  }

  updateLexicon(value: { phrase: string, score: number, model: string }) {
    // remove selected item from predictions list
    this.predictions = this.predictions.filter((x: any) => {
      return x.phrase !== value.phrase;
    });
    this.positives += this.positives.endsWith('\n') ? value.phrase + '\n' : '\n' + value.phrase;
    this._lexicon.phrases = this.newLineStringToList(this.positives);
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

  saveEmbeddingChoice(embedding: Embedding) {
    this.localStorageService.setLexiconMinerEmbeddingId(embedding.id);
  }
}

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

@Component({
  selector: 'app-lexicon-builder',
  templateUrl: './lexicon-builder.component.html',
  styleUrls: ['./lexicon-builder.component.scss']
})
export class LexiconBuilderComponent implements OnInit, OnDestroy {
  _lexicon: Lexicon;
  positives: string;
  predictions: any[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  embeddings: Embedding[];
  selectedEmbedding: Embedding;

  @Input() set lexicon(value: Lexicon) {
    if (value) {
      this._lexicon = value;
      this.positives = this.stringListToString(value.phrases_parsed);
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

  getNewSuggestions() {
    // was doing stuff here todo (assign positives and get new predictions)
    console.log(this.selectedEmbedding)
    this.projectStore.getCurrentProject().pipe(take(1), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingService.predict({
          positives: this.newLineStringToList(this.positives),
          negatives: []
        }, currentProject.id, this.selectedEmbedding.id);
      }
    })).subscribe((resp: any | HttpErrorResponse) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          console.log(resp);
          this.predictions = resp;
        }
      }
    });
  }

  saveLexicon(lexicon: Lexicon) {
    const requestBody = {
      description: lexicon.description,
      phrases: this.newLineStringToList(this.positives)
    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.lexiconService.updateLexicon(requestBody, currentProject.id, lexicon.id);
      }
      return of(null);
    })).subscribe((x: any) => {
      console.log(x);
    });
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

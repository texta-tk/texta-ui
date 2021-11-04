import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Lexicon} from '../../shared/types/Lexicon';
import {LexiconService} from '../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../core/projects/project.store';
import {filter, pairwise, switchMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../../shared/types/Project';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {EmbeddingsService} from '../../core/models/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {LocalStorageService} from 'src/app/core/util/local-storage.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ActivatedRoute, CanDeactivate, NavigationStart, Router} from '@angular/router';
import {Embedding, EmbeddingPrediction} from '../../shared/types/tasks/Embedding';
import {CanDeactivateComponent} from '../../core/guards/deactivate.guard';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {ConfirmDialogComponent} from '../../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';

interface TextareaLexicon {
  positives_used: string;
  negatives_used: string;
  positives_unused: string;
  negatives_unused: string;
}

@Component({
  selector: 'app-lexicon-builder',
  templateUrl: './lexicon-builder.component.html',
  styleUrls: ['./lexicon-builder.component.scss']
})
export class LexiconBuilderComponent implements OnInit, OnDestroy, CanDeactivateComponent {
  newSuggestions: EmbeddingPrediction[] = [];
  textareaLexicon: TextareaLexicon;
  lexicon: Lexicon;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: BehaviorSubject<Project | null> = new BehaviorSubject<Project | null>(null);
  selectedEmbedding: Embedding | undefined;
  embeddings: Embedding[] = [];
  isLoadingPredictions = false;

  constructor(private logService: LogService,
              private lexiconService: LexiconService,
              private embeddingService: EmbeddingsService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private router: Router,
              private projectStore: ProjectStore,
              private localStorageService: LocalStorageService) {
  }

  ngOnInit(): void {
    const lexiconId = Number(this.route.snapshot.paramMap.get('lexiconId'));
    if (lexiconId) {
      this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
        if (proj) {
          if (this.currentProject.value && proj) {
            this.router.navigate(['lexicons']);
            this.destroyed$.next(true);
          }
          this.currentProject.next(proj);
          return this.lexiconService.getLexicon(proj.id, lexiconId);
        }
        return of(null);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.lexicon = resp;
          this.textareaLexicon = this.lexiconToTextareaLexicon(resp);
        } else if (resp) {
          this.logService.snackBarError(resp);
        }
      });
    }
    this.currentProject.pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        return this.embeddingService.getEmbeddings(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.embeddings = resp.results.filter((embedding: Embedding) => {
          return embedding.task.status === 'completed';
        });
        this.getSavedDefaultEmbedding();

      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  getSavedDefaultEmbedding(): void {
    this.currentProject.pipe(take(1)).subscribe(proj => {
      if (proj) {
        const state = this.localStorageService.getProjectState(proj);
        if (state?.lexicons.embeddingId) {
          this.embeddings.forEach((embedding: Embedding) => {
            if (state?.lexicons.embeddingId === embedding.id) {
              this.selectedEmbedding = embedding;
            }
          });
        }
      }
    });
  }

  saveEmbeddingChoice(embedding: Embedding): void {
    this.currentProject.pipe(take(1)).subscribe(proj => {
      if (proj) {
        const state = this.localStorageService.getProjectState(proj);
        if (state) {
          state.lexicons.embeddingId = embedding.id;
          this.localStorageService.updateProjectState(proj, state);
        }
      }
    });
  }

  getNewSuggestions(): void {
    const embedding = this.selectedEmbedding;
    if (embedding && this.textareaLexicon) {
      if (this.newSuggestions.length > 0) {
        this.textareaLexicon.negatives_unused = this.appendSuggestionsToTextarea(this.textareaLexicon.negatives_unused, this.newSuggestions);
      }
      this.isLoadingPredictions = true;

      this.currentProject.pipe(take(1), switchMap(proj => {
        if (proj) {
          return this.embeddingService.predict(this.formatPredictQuery(this.textareaLexicon), proj.id, embedding.id);
        }
        return of(null);
      })).subscribe(resp => {
        this.isLoadingPredictions = false;
        if (resp && !(resp instanceof HttpErrorResponse)) {
          // to avoid layout thrashing with loading icon
          this.newSuggestions = resp;
        } else if (resp) {
          this.logService.snackBarError(resp);
        }
      });
    }
  }

  clearLexicon(): void {
    if (this.textareaLexicon) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {confirmText: 'Clear', mainText: 'Are you sure you want to clear this Lexicon?'}
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.textareaLexicon.positives_unused = '';
          this.textareaLexicon.negatives_unused = '';
          this.textareaLexicon.positives_used = '';
          this.textareaLexicon.negatives_used = '';
          this.newSuggestions = [];
        }
      });
    }
  }

  moveLexiconWords(textareaOrigin: keyof TextareaLexicon, textareaDestination: keyof TextareaLexicon): void {
    if (textareaOrigin && textareaDestination && textareaOrigin !== textareaDestination) {
      const toMove = this.newLineStringToList(this.textareaLexicon[textareaOrigin]);
      let destination = this.textareaLexicon[textareaDestination];
      toMove.forEach(el => {
        if (destination === '') {
          destination += el + '\n';
        } else {
          destination += destination.endsWith('\n') ? el + '\n' : '\n' + el;
        }
      });
      this.textareaLexicon[textareaDestination] = destination;
      this.textareaLexicon[textareaOrigin] = '';
    }
  }

  saveLexicon(): void {
    if (this.textareaLexicon) {
      this.currentProject.pipe(take(1), switchMap(proj => {
        if (proj) {
          const body: Partial<Lexicon> = {
            negatives_unused: this.newLineStringToList(this.textareaLexicon.negatives_unused),
            positives_used: this.newLineStringToList(this.textareaLexicon.positives_used),
            positives_unused: this.newLineStringToList(this.textareaLexicon.positives_unused),
            negatives_used: this.newLineStringToList(this.textareaLexicon.negatives_used),
          };
          return this.lexiconService.updateLexicon(body, proj.id, this.lexicon.id);
        }
        return of(null);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.lexicon = resp;
          this.logService.snackBarMessage('Lexicon saved', 3000);
        } else if (resp) {
          this.logService.snackBarError(resp);
        }
      });
    }
  }

  formatPredictQuery(lexicon: TextareaLexicon): Partial<Lexicon> & { output_size: number } {
    const returnval: Partial<Lexicon> & { output_size: number } = {
      negatives_unused: [],
      negatives_used: [],
      positives_used: [],
      positives_unused: [],
      output_size: 25
    };
    returnval.negatives_unused = this.newLineStringToList(lexicon.negatives_unused);
    returnval.negatives_used = this.newLineStringToList(lexicon.negatives_used);
    returnval.positives_used = this.newLineStringToList(lexicon.positives_used);
    returnval.positives_unused = this.newLineStringToList(lexicon.positives_unused);
    return returnval;
  }

  lexiconToTextareaLexicon(lexicon: Lexicon): TextareaLexicon {
    const returnval = {
      negatives_unused: '',
      negatives_used: '',
      positives_used: '',
      positives_unused: ''
    };
    returnval.negatives_unused = this.stringListToString(lexicon.negatives_unused);
    returnval.negatives_used = this.stringListToString(lexicon.negatives_used);
    returnval.positives_used = this.stringListToString(lexicon.positives_used);
    returnval.positives_unused = this.stringListToString(lexicon.positives_unused);
    return returnval;
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  addPositive(suggestion: EmbeddingPrediction): void {
    if (this.textareaLexicon) {
      // remove selected item from predictions list
      this.newSuggestions = this.newSuggestions.filter(x => {
        return x.phrase !== suggestion.phrase;
      });
      this.textareaLexicon.positives_used = this.appendSuggestionsToTextarea(this.textareaLexicon.positives_used, [suggestion]);
    }
  }

  appendSuggestionsToTextarea(textAreaString: string, suggestions: EmbeddingPrediction[]): string {
    suggestions.forEach(el => {
      if (textAreaString === '') {
        textAreaString += el.phrase + '\n';
      } else {
        textAreaString += textAreaString.endsWith('\n') ? el.phrase + '\n' : '\n' + el.phrase;
      }
    });
    return textAreaString;
  }

  canDeactivate(): boolean {
    const body = this.formatPredictQuery(this.textareaLexicon);
    if (body.negatives_unused && !UtilityFunctions.arrayValuesEqual(body.negatives_unused, this.lexicon.negatives_unused)) {
      return false;
    }
    if (body.negatives_used && !UtilityFunctions.arrayValuesEqual(body.negatives_used, this.lexicon.negatives_used)) {
      return false;
    }
    if (body.positives_used && !UtilityFunctions.arrayValuesEqual(body.positives_used, this.lexicon.positives_used)) {
      return false;
    }
    return !(body.positives_unused && !UtilityFunctions.arrayValuesEqual(body.positives_unused, this.lexicon.positives_unused));

  }
}

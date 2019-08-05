import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {Lexicon} from '../shared/types/Lexicon';
import {LogService} from '../core/util/log.service';
import {LexiconService} from '../core/lexicon/lexicon.service';
import {ProjectStore} from '../core/projects/project.store';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {EmbeddingsService} from '../core/embeddings/embeddings.service';
import {Embedding} from '../shared/types/tasks/Embedding';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material';


@Component({
  selector: 'app-lexicon-miner',
  templateUrl: './lexicon-miner.component.html',
  styleUrls: ['./lexicon-miner.component.scss']
})
export class LexiconMinerComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  lexicons: Lexicon[];
  embeddings: Embedding[];
  newLexiconDescription = '';
  selectedLexicon: Lexicon;

  constructor(private logService: LogService,
              private dialog: MatDialog,
              private embeddingService: EmbeddingsService,
              private lexiconService: LexiconService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    // you need both lexicons and embeddings to use lexicon miner, so just forkjoin if one of them errors cant do anything
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe((resp: Lexicon[] | HttpErrorResponse) => {
        if (resp) {
          if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 5000);
          } else {
            this.selectedLexicon = null;
            this.lexicons = resp;
          }
        }
      }
    );
  }

  ngOnDestroy() {
    // will complete all observables aswell when using takeUntil, takeWhile etc
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  createNewLexicon() {
    this.projectStore.getCurrentProject().pipe(take(1), switchMap(currentProject => {
      if (currentProject) {
        return this.lexiconService.createLexicon({
          description: this.newLexiconDescription,
          phrases: []
        }, currentProject.id);
      }
      return of(null);
    })).subscribe((resp: Lexicon | HttpErrorResponse) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          this.lexicons.push(resp);
        }
        this.newLexiconDescription = '';
      }
    });
  }

  deleteLexicon(lexicon: Lexicon) {
    this.projectStore.getCurrentProject().pipe(take(1), switchMap(currentProject => {
      if (currentProject) {
        return this.lexiconService.deleteLexicon(currentProject.id, lexicon.id);
      }
      return of(null);
    })).subscribe((resp: Lexicon | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        const position = this.lexicons.findIndex(x => x.id === lexicon.id);
        this.lexicons.splice(position, 1);
      }
    });
  }

  selectLexicon(lexicon: Lexicon) {
    if (this.selectedLexicon && this.selectedLexicon === lexicon) {
      // if selecting same lexicon do nothing
      return true;
    }
    this.selectedLexicon = lexicon;
  }

}

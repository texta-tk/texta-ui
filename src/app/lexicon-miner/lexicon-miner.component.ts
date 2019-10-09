import {Component, OnDestroy, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {Lexicon} from '../shared/types/Lexicon';
import {LogService} from '../core/util/log.service';
import {LexiconService} from '../core/lexicon/lexicon.service';
import {ProjectStore} from '../core/projects/project.store';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'app-lexicon-miner',
  templateUrl: './lexicon-miner.component.html',
  styleUrls: ['./lexicon-miner.component.scss']
})
export class LexiconMinerComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  lexicons: Lexicon[] = [];
  newLexiconDescription = '';
  selectedLexicon: Lexicon;
  currentProject: Project;
  pageSize = 30;
  totalLexicons: number;

  constructor(private logService: LogService,
              private lexiconService: LexiconService, private projectStore: ProjectStore) {
  }

  ngOnInit() {
    // you need both lexicons and embeddings to use lexicon miner, so just forkjoin if one of them errors cant do anything
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.lexiconService.getLexicons(
          currentProject.id,
          `page=1&page_size=${this.pageSize}`
        );
      }
      return of(null);
    })).subscribe((resp: {count: number, results: Lexicon[]} | HttpErrorResponse) => {
        if (resp) {
          if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 5000);
          } else {
            this.selectedLexicon = null;
            this.totalLexicons = resp.count;
            this.lexicons = resp.results;
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
    if (this.currentProject) {
      this.lexiconService.createLexicon({
          description: this.newLexiconDescription,
          phrases: []
      }, this.currentProject.id
      ).subscribe((resp: Lexicon | HttpErrorResponse) => {
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
}

  deleteLexicon(lexicon: Lexicon) {
    return this.lexiconService.deleteLexicon(this.currentProject.id, lexicon.id)
    .subscribe((resp: Lexicon | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        this.logService.snackBarMessage(`Lexicon ${lexicon.description} deleted.`, 3000);
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

  onScrollLexicons($event) {
    if (this.currentProject && this.lexicons.length < this.totalLexicons) {
      this.lexiconService.getLexicons(
        this.currentProject.id,
        `page=${Math.round(this.lexicons.length / this.pageSize) + 1}&page_size=${this.pageSize}`)
        .subscribe((resp: {count: number, results: Lexicon[]}) => {
          this.totalLexicons = resp.count;
          this.lexicons = [...this.lexicons, ...resp.results];
        });
    }
  }
}

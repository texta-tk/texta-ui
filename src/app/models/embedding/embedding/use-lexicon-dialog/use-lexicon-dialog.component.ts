import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Project} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {Lexicon} from '../../../../shared/types/Lexicon';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {LogService} from '../../../../core/util/log.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from "../../../../core/util/local-storage.service";
import {Embedding} from "../../../../shared/types/tasks/Embedding";
import {Router} from "@angular/router";

@Component({
  selector: 'app-use-lexicon-dialog',
  templateUrl: './use-lexicon-dialog.component.html',
  styleUrls: ['./use-lexicon-dialog.component.scss']
})
export class UseLexiconDialogComponent implements OnInit, OnDestroy {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  method: 'existing' | 'new' = 'existing';
  lexicons: Lexicon[];
  newLexDesc: string;
  selectedLexicon: Lexicon;
  type: 'positives_used' | 'positives_unused' | 'negatives_used' | 'negatives_unused' = 'positives_used';

  constructor(private dialogRef: MatDialogRef<UseLexiconDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: {
                embedding: Embedding;
              },
              private lexiconService: LexiconService,
              private localStorageService: LocalStorageService,
              private logService: LogService,
              private router: Router,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.lexiconService.getLexicons(proj.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.lexicons = resp.results;
      } else if (resp) {
        this.logService.snackBarError(resp);
      }
    });
  }

  onSubmit(): void {
    if (this.currentProject.id && this.data.embedding) {
      if (this.method === 'existing' && this.selectedLexicon.id) {
        const state = this.localStorageService.getProjectState(this.currentProject.id);
        if (state) {
          state.lexicons.embeddingId = this.data.embedding.id;
          this.localStorageService.updateProjectState(this.currentProject, state);
        }
        this.router.navigate(['/lexicons/', this.selectedLexicon.id]);
        this.closeDialog();
      } else {
        this.lexiconService.createLexicon({
          description: this.newLexDesc,
        }, this.currentProject.id).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            const state = this.localStorageService.getProjectState(this.currentProject.id);
            if (state) {
              state.lexicons.embeddingId = this.data.embedding.id;
              this.localStorageService.updateProjectState(this.currentProject, state);
            }
            this.router.navigate(['/lexicons/', resp.id]);
            this.closeDialog();
          } else if (resp) {
            this.logService.snackBarError(resp);
          }
        });
      }
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

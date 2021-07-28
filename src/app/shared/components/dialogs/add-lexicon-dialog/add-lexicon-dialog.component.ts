import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Evaluator} from '../../../types/tasks/Evaluator';
import {EvaluatorService} from '../../../../core/tools/evaluator/evaluator.service';
import {LogService} from '../../../../core/util/log.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {Project} from '../../../types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {Lexicon} from '../../../types/Lexicon';

@Component({
  selector: 'app-add-lexicon-dialog',
  templateUrl: './add-lexicon-dialog.component.html',
  styleUrls: ['./add-lexicon-dialog.component.scss']
})
export class AddLexiconDialogComponent implements OnInit, OnDestroy {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  lexWords: string;
  method: 'existing' | 'new' = 'existing';
  lexicons: Lexicon[];
  newLexDesc: string;
  selectedLexicon: Lexicon;
  type: 'positives_used' | 'positives_unused' | 'negatives_used' | 'negatives_unused' = 'positives_used';

  constructor(private dialogRef: MatDialogRef<AddLexiconDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: string[],
              private lexiconService: LexiconService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      this.lexWords = this.stringListToString(this.data);
    }
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

  onSubmit(): void {
    if (this.currentProject.id) {
      const listWords = this.newLineStringToList(this.lexWords);
      if (this.method === 'existing' && this.selectedLexicon.id) {
        this.selectedLexicon[this.type].push(...listWords);
        this.lexiconService.updateLexicon(this.selectedLexicon, this.currentProject.id, this.selectedLexicon.id).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Updated lexicon: ' + this.selectedLexicon.description, 5000);
            this.closeDialog();
          } else if (resp) {
            this.logService.snackBarError(resp);
          }
        });
      } else {
        this.lexiconService.createLexicon({
          description: this.newLexDesc,
          [this.type]: listWords
        }, this.currentProject.id).subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.logService.snackBarMessage('Created lexicon: ' + this.newLexDesc, 5000);
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

import {AfterViewInit, Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {ProjectStore} from '../../core/projects/project.store';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {LexiconService} from '../../core/lexicon/lexicon.service';
import {ScrollableDataSource} from '../../shared/ScrollableDataSource';
import {Lexicon} from '../../shared/types/Lexicon';
import {switchMap, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {BehaviorSubject, forkJoin, Observable, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {Project, ProjectIndex} from '../../shared/types/Project';
import {UserProfile} from '../../shared/types/UserProfile';
import {ResultsWrapper} from '../../shared/types/Generic';
import {LabelSet} from '../../shared/types/tasks/LabelSet';

interface OnSubmitParams {
  targetFormControl: Lexicon;
  sourceFormControl: Lexicon[];
  mergeOptionFormControl: 'positive' | 'entire';
}

interface LexTypes {
  positives_used: string[];
  negatives_used: string[];
  positives_unused: string[];
  negatives_unused: string[];
}

@Component({
  selector: 'app-merge-lexicon-dialog',
  templateUrl: './merge-lexicon-dialog.component.html',
  styleUrls: ['./merge-lexicon-dialog.component.scss']
})
export class MergeLexiconDialogComponent implements OnInit {
  mergeForm = new UntypedFormGroup({
    targetFormControl: new UntypedFormControl(null, [Validators.required]),
    sourceFormControl: new UntypedFormControl([], [Validators.required]),
    mergeOptionFormControl: new UntypedFormControl('positive', [Validators.required])
  });

  lexicons: ScrollableDataSource<Lexicon>;
  currentUser: UserProfile;
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private dialogRef: MatDialogRef<MergeLexiconDialogComponent>,
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(take(1)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
        this.lexicons = new ScrollableDataSource(this.fetchFn, this);
      }
      return of(null);
    });
  }


  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<Lexicon> | HttpErrorResponse> {
    return context.lexiconService.getLexicons(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
  }

  onSubmit(value: OnSubmitParams): void {
    this.isLoading.next(true);
    let merged: {};
    if (value.mergeOptionFormControl === 'positive') {
      merged = this.mergePositives(value.targetFormControl, value.sourceFormControl);
    } else {
      merged = this.mergeLexicons(value.targetFormControl, value.sourceFormControl);
    }
    this.lexiconService.updateLexicon(merged, this.currentProject.id, value.targetFormControl.id).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage('Merge successful!', 2000);
      } else {
        this.logService.snackBarError(resp);
      }
      this.isLoading.next(false);
    });
  }

  private mergeLexicons(target: Lexicon, sources: Lexicon[]): LexTypes {
    const returnVal = {
      positives_used: target.positives_used,
      negatives_used: target.negatives_used,
      positives_unused: target.positives_unused,
      negatives_unused: target.negatives_unused
    };
    sources.forEach(x => {
      x.positives_used.forEach(y => {
        if (!returnVal.positives_used.includes(y)) {
          returnVal.positives_used.push(y);
        }
      });
      x.negatives_used.forEach(y => {
        if (!returnVal.negatives_used.includes(y)) {
          returnVal.negatives_used.push(y);
        }
      });
      x.positives_unused.forEach(y => {
        if (!returnVal.positives_unused.includes(y)) {
          returnVal.positives_unused.push(y);
        }
      });
      x.negatives_unused.forEach(y => {
        if (!returnVal.negatives_unused.includes(y)) {
          returnVal.negatives_unused.push(y);
        }
      });
    });
    return returnVal;
  }

  private mergePositives(target: Lexicon, sources: Lexicon[]): { positives_used: string[] } {
    const positives = target.positives_used;
    sources.forEach(x => {
      x.positives_used.forEach(y => {
        if (!positives.includes(y)) {
          positives.push(y);
        }
      });
    });
    return {positives_used: positives};
  }
}

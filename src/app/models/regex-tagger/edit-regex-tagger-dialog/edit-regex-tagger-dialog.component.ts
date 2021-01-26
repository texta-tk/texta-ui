import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Lexicon} from '../../../shared/types/Lexicon';
import {Project} from '../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {MatMenuTrigger} from '@angular/material/menu';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {switchMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';

@Component({
  selector: 'app-edit-regex-tagger-dialog',
  templateUrl: './edit-regex-tagger-dialog.component.html',
  styleUrls: ['./edit-regex-tagger-dialog.component.scss']
})
export class EditRegexTaggerDialogComponent implements OnInit, OnDestroy {
  regexTaggerForm: FormGroup;

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  lexicons: Lexicon[] = [];
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(private dialogRef: MatDialogRef<EditRegexTaggerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RegexTagger,
              private regexTaggerService: RegexTaggerService,
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {
    if (this.data) {
      this.regexTaggerForm = new FormGroup({
        descriptionFormControl: new FormControl(this.data.description, [
          Validators.required,
        ]),
        lexiconFormControl: new FormControl(this.stringListToString(this.data.lexicon), [
          Validators.required,
        ]),
        counterLexiconFormControl: new FormControl(this.stringListToString(this.data.counter_lexicon)),
        operatorFormControl: new FormControl(this.data.operator, [
          Validators.required,
        ]),
        matchTypeFormControl: new FormControl(this.data.match_type, [
          Validators.required,
        ]),
        requiredWordsFormControl: new FormControl(this.data.required_words, [
          Validators.required, Validators.min(0), Validators.max(1)
        ]),
        phraseSlopFormControl: new FormControl(this.data.phrase_slop, [
          Validators.required,
        ]),
        counterSlopFormControl: new FormControl(this.data.counter_slop, [
          Validators.required,
        ]),
        allowedEditsFormControl: new FormControl(this.data.n_allowed_edits, [
          Validators.required,
        ]),

        fuzzyMatchFormControl: new FormControl(this.data.return_fuzzy_match),
        ignoreCaseFormControl: new FormControl(this.data.ignore_case),
        ignorePunctuationFormControl: new FormControl(this.data.ignore_punctuation),
      });
    }
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

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.lexicons = resp.results;
      }
    });
  }

  public addLexicon(val: Lexicon, control: AbstractControl): void {
    if (control) {
      const formControlValue = control.value as string;
      let phrases = '';
      if (val.positives_used || val.positives_unused) {
        val.positives_used.forEach(x => {
          phrases += x + '\n';
        });
        val.positives_unused.forEach(x => {
          phrases += x + '\n';
        });
      }
      if (formControlValue.endsWith('\n') || formControlValue === '') {
        control.setValue(formControlValue + phrases);
      } else {
        control.setValue(formControlValue + '\n' + phrases);
      }
    }
    this.trigger.closeMenu();
  }

  // @ts-ignore
  onSubmit(formData): void {
    const body = {
      description: formData.descriptionFormControl,
      lexicon: formData.lexiconFormControl.length > 0 ? formData.lexiconFormControl.split('\n').filter((x: unknown) => x) : [],
      counter_lexicon: formData.counterLexiconFormControl.length > 0 ?
        formData.counterLexiconFormControl.split('\n').filter((x: unknown) => x) : [],
      operator: formData.operatorFormControl,
      match_type: formData.matchTypeFormControl,
      required_words: formData.requiredWordsFormControl,
      phrase_slop: formData.phraseSlopFormControl,
      counter_slop: formData.counterSlopFormControl,
      n_allowed_edits: formData.allowedEditsFormControl,
      return_fuzzy_match: formData.fuzzyMatchFormControl,
      ignore_case: formData.ignoreCaseFormControl,
      ignore_punctuation: formData.ignorePunctuationFormControl,
    };
    this.regexTaggerService.patchRegexTagger(this.currentProject.id, this.data.id, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.dialogRef.close(x);
      } else {
        if (x.error.hasOwnProperty('lexicon')) {
          this.logService.snackBarMessage(x.error.lexicon.join(','), 5000);
        } else {
          this.logService.snackBarError(x);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

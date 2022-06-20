import {Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Lexicon} from '../../../shared/types/Lexicon';
import {MatMenuTrigger} from '@angular/material/menu';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';
import {forkJoin, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';

@Component({
  selector: 'app-create-regex-tagger-dialog',
  templateUrl: './create-regex-tagger-dialog.component.html',
  styleUrls: ['./create-regex-tagger-dialog.component.scss']
})
export class CreateRegexTaggerDialogComponent implements OnInit, OnDestroy {
  regexTaggerForm = new FormGroup({
    descriptionFormControl: new FormControl(this.data?.cloneTagger?.description || '', [
      Validators.required,
    ]),
    lexiconFormControl: new FormControl('', [
      Validators.required,
    ]),
    counterLexiconFormControl: new FormControl(''),
    operatorFormControl: new FormControl(this.data?.cloneTagger?.operator || 'or', [
      Validators.required,
    ]),
    matchTypeFormControl: new FormControl(this.data?.cloneTagger?.match_type || 'prefix', [
      Validators.required,
    ]),
    requiredWordsFormControl: new FormControl(this.data?.cloneTagger?.required_words || 1, [
      Validators.required, Validators.min(0), Validators.max(1)
    ]),
    phraseSlopFormControl: new FormControl(this.data?.cloneTagger?.phrase_slop || 0, [
      Validators.required,
    ]),
    counterSlopFormControl: new FormControl(this.data?.cloneTagger?.counter_slop || 0, [
      Validators.required,
    ]),
    allowedEditsFormControl: new FormControl(this.data?.cloneTagger?.n_allowed_edits || 0, [
      Validators.required,
    ]),

    fuzzyMatchFormControl: new FormControl(this.data?.cloneTagger?.return_fuzzy_match !== false),
    ignoreCaseFormControl: new FormControl(this.data?.cloneTagger?.ignore_case !== false),
    ignorePunctuationFormControl: new FormControl(this.data?.cloneTagger?.ignore_punctuation !== false),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  lexicons: Lexicon[] = [];
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject();
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(private dialogRef: MatDialogRef<CreateRegexTaggerDialogComponent>,
              private regexTaggerService: RegexTaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { cloneTagger: RegexTagger },
              private logService: LogService,
              private lexiconService: LexiconService,
              private projectStore: ProjectStore) {
  }

  private populateFormControlsWithCloneData(tagger: RegexTagger): void {
    if(tagger.lexicon){
      this.regexTaggerForm.get('lexiconFormControl')?.setValue(tagger.lexicon.join('\n'));
    }
    if(tagger.counter_lexicon){
      this.regexTaggerForm.get('counterLexiconFormControl')?.setValue(tagger.counter_lexicon.join('\n'));
    }
  }

  ngOnInit(): void {
    if (this.data.cloneTagger) {
      this.populateFormControlsWithCloneData(this.data.cloneTagger);
    }

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return forkJoin({
          lexicons: this.lexiconService.getLexicons(currentProject.id),
          options: this.regexTaggerService.getRegexTaggerOptions(currentProject.id)
        });
      }
      return of(null);
    })).subscribe(resp => {
      if (resp) {
        if (!(resp.options instanceof HttpErrorResponse)) {
          this.regexTaggerOptions = resp.options;
        }
        if (!(resp.lexicons instanceof HttpErrorResponse)) {
          this.lexicons = resp.lexicons.results;
        }
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
    this.regexTaggerService.createRegexTagger(this.currentProject.id, body).subscribe(x => {
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

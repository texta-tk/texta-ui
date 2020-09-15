import {Component, ElementRef, Inject, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormControl, NgModel} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {RegexTaggerService} from '../../../core/models/taggers/regex-tagger.service';

@Component({
  selector: 'app-tag-doc-dialog',
  templateUrl: './tag-doc-dialog.component.html',
  styleUrls: ['./tag-doc-dialog.component.scss']
})
export class TagDocDialogComponent implements OnInit, OnDestroy {
  fields: string[] = [];
  result: unknown;
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model = {selectedFields: '', doc: ''};
  docChangedSubject$: Subject<[string, NgModel]> = new Subject();
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private regexTaggerService: RegexTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTagger; }) {
  }

  ngOnInit(): void {
    this.docChangedSubject$.pipe(takeUntil(this.destroyed$), debounceTime(200)).subscribe(x => {
      if (x) {
        this.fields = [];
        const val = x[0];
        const docRef = x[1];
        try {
          const parsed = JSON.parse(val);
          for (const field in parsed) {
            if (parsed.hasOwnProperty(field)) {
              this.fields.push(field);
            }
          }
          docRef.control.setErrors(null);
        } catch (e) {
          docRef.control.setErrors({invalidJson: true});
        }
      }
    });

  }

  docChanged(val: string, docRef: NgModel): void {
    this.docChangedSubject$.next([val, docRef]);
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        fields: this.model.selectedFields,
        doc: JSON.parse(this.model.doc)
      };
      this.regexTaggerService.tagDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x.matches;
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

import {Component, OnInit, Inject, OnDestroy} from '@angular/core';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {Tagger} from 'src/app/shared/types/tasks/Tagger';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-tag-doc-dialog',
  templateUrl: './tag-doc-dialog.component.html',
  styleUrls: ['./tag-doc-dialog.component.scss']
})
export class TagDocDialogComponent implements OnInit, OnDestroy {
  lemmatize: boolean;
  defaultDoc: string;
  result: { result: boolean, probability: number, feedback?: { id: string }, tag: string };
  feedback = false;
  isLoading = false;

  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  tagDocOptions: any;

  constructor(private taggerService: TaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger.fields && this.data.tagger.fields.length > 0) {
      this.defaultDoc = `{ "${this.data.tagger.fields[0]}": " " }`;
    }

    this.taggerService.getTagDocOptions(this.data.currentProjectId, this.data.tagger.id).pipe(
      takeUntil(this.destroyed$)).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.tagDocOptions = options;
      }
    });
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }


  onSubmit(doc: string): void {
    this.isLoading = true;
    this.taggerService.tagDocument({
      doc: JSON.parse(doc),
      lemmatize: this.lemmatize,
      feedback_enabled: this.feedback,
    }, this.data.currentProjectId, this.data.tagger.id)
      .subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp as { result: boolean, probability: number, feedback?: { id: string }, tag: string };
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
      }, null, () => this.isLoading = false);
  }
}

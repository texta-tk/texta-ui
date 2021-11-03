import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {Tagger} from '../../../shared/types/tasks/Tagger';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit, OnDestroy {
  lemmatize: boolean;
  result: { result: boolean, probability: number, feedback?: { id: string }, tag: string };
  feedback = false;
  isLoading = false;

  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  tagTextOptions: any;

  constructor(private taggerService: TaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit(): void {
    if (this.data?.tagger?.id) {
      this.taggerService.getTagTextOptions(this.data.currentProjectId, this.data.tagger.id).pipe(
        takeUntil(this.destroyed$)).subscribe(options => {
        if (options && !(options instanceof HttpErrorResponse)) {
          this.tagTextOptions = options;
        }
      });
    }
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onSubmit(value: string): void {
    this.isLoading = true;
    if (this.data?.tagger?.id) {
      this.taggerService.tagText({
        text: value, lemmatize: this.lemmatize,
        feedback_enabled: this.feedback,
      }, this.data.currentProjectId, this.data.tagger.id)
        .subscribe(resp => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.result = resp as { result: boolean, probability: number, feedback?: { id: string }, tag: string };
          } else if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 4000);
          }
          this.isLoading = false;
        });
    }
  }
}

import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {TaggerGroupService} from 'src/app/core/models/taggers/tagger-group.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-tagger-group-tag-doc-dialog',
  templateUrl: './tagger-group-tag-doc-dialog.component.html',
  styleUrls: ['./tagger-group-tag-doc-dialog.component.scss']
})
export class TaggerGroupTagDocDialogComponent implements OnInit, OnDestroy {
  lemmatize = false;
  ner = false;
  nSimilarDocs = 25;
  results: { probability: number; tag: string; tagger_id: number }[] = [];
  errors = '';
  submitted = false;
  loading: boolean;

  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  tagDocOptions: any;

  constructor(
    private taggerGroupService: TaggerGroupService,
    @Inject(MAT_DIALOG_DATA)
    public data: { currentProjectId: number; taggerId: number }) {
  }

  ngOnInit(): void {
    this.taggerGroupService.getTagTextOptions(this.data.currentProjectId, this.data.taggerId).pipe(
      takeUntil(this.destroyed$)).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.tagDocOptions = options;
      }
    });
  }

  onSubmit(value: string): void {
    this.errors = '';
    this.results = [];

    try {
      value = JSON.parse(value);
    } catch (e) {
      this.errors = 'Input is not a valid JSON';
      return;
    }

    this.loading = true;
    this.taggerGroupService.tagDoc({
        doc: value,
        lemmatize: this.lemmatize,
        use_ner: this.ner,
        n_similar_docs: this.nSimilarDocs
      },
      this.data.currentProjectId,
      this.data.taggerId).subscribe((resp: { probability: number; tag: string; tagger_id: number }[] | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.results = resp;
        } else if (resp instanceof HttpErrorResponse) {
          this.errors = resp.error.error;
        }
        this.loading = false;
      },
    );
  }


  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

import { Component, Inject } from '@angular/core';
import { TaggerGroupService } from 'src/app/core/models/taggers/tagger-group.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tagger-group-tag-doc-dialog',
  templateUrl: './tagger-group-tag-doc-dialog.component.html',
  styleUrls: ['./tagger-group-tag-doc-dialog.component.scss']
})
export class TaggerGroupTagDocDialogComponent {
  lemmatize = false;
  ner = false;
  nSimilarDocs = 10;
  results: { probability: number; tag: string; tagger_id: number }[] = [];
  errors = '';
  submitted = false;
  loading: boolean;

  constructor(
    private taggerGroupService: TaggerGroupService,
    @Inject(MAT_DIALOG_DATA)
    public data: { currentProjectId: number; taggerId: number }
  ) {}

  onSubmit(value) {
    this.errors = '';
    this.results = [];

    try {
      value = JSON.parse(value);
    } catch (e) {
      this.errors = 'Input is not a valid JSON';
      // Break out of function
      return;
    }

    this.loading = true;
    this.taggerGroupService
      .tagDoc(
        {
          doc: value,
          lemmatize: this.lemmatize,
          use_ner: this.ner,
          n_similar_docs: this.nSimilarDocs
        },
        this.data.currentProjectId,
        this.data.taggerId
      )
      .subscribe(
        (resp: { probability: number; tag: string; tagger_id: number }[] | HttpErrorResponse) => {
          if (resp && !(resp instanceof HttpErrorResponse)) {
            this.results = resp;
          } else if (resp instanceof HttpErrorResponse) {
            this.errors = resp.error.error;
          }
          this.loading = false;
        },
      );
  }
}

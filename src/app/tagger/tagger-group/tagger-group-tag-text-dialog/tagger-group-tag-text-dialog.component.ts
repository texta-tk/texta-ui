import { Component, OnInit, Inject } from '@angular/core';
import { TaggerGroupService } from 'src/app/core/taggers/tagger-group.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-tagger-group-tag-text-dialog',
  templateUrl: './tagger-group-tag-text-dialog.component.html',
  styleUrls: ['./tagger-group-tag-text-dialog.component.scss']
})
export class TaggerGroupTagTextDialogComponent {
  lemmatize = false;
  ner = false;
  results: { probability: number, tag: string, tagger_id: number }[] = [];

  constructor(private taggerGroupService: TaggerGroupService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  onSubmit(value) {
    this.taggerGroupService.tagText(
      {text: value, lemmatize: this.lemmatize, use_ner: this.ner}, this.data.currentProjectId, this.data.taggerId)
      .subscribe((resp: { probability: number, tag: string, tagger_id: number }[] | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.results = resp;
        } else if (resp instanceof HttpErrorResponse){
          this.logService.snackBarError(resp, 4000);
        }
    });
  }


}

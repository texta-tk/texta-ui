import {Component, OnInit, Inject} from '@angular/core';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Tagger} from 'src/app/shared/types/tasks/Tagger';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-tag-doc-dialog',
  templateUrl: './tag-doc-dialog.component.html',
  styleUrls: ['./tag-doc-dialog.component.scss']
})
export class TagDocDialogComponent implements OnInit {
  lemmatize: boolean;
  defaultDoc: string;
  result: { result: boolean, probability: number };

  constructor(private taggerService: TaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger.fields && this.data.tagger.fields.length > 0) {
      this.defaultDoc = `{ "${this.data.tagger.fields[0]}": " " }`;
    }
  }

  onSubmit(doc) {
    this.taggerService.tagDocument({
      doc: JSON.parse(doc),
      lemmatize: this.lemmatize
    }, this.data.currentProjectId, this.data.tagger.id)
    .subscribe((resp: { result: boolean, probability: number } | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse){
        this.logService.snackBarError(resp, 4000);
      }
    });
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { NeuroTaggerService } from 'src/app/core/neuro-tagger/neuro-tagger.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { NeuroTagger } from 'src/app/shared/types/tasks/NeuroTagger';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-neurotag-doc-dialog',
  templateUrl: './neurotag-doc-dialog.component.html',
  styleUrls: ['./neurotag-doc-dialog.component.scss']
})
export class NeurotagDocDialogComponent implements OnInit {
  defaultThreshold = 0.3;
  defaultDoc: string;
  result: { tags: { tag: string, probability: number }[]};
  options: any;

  constructor(private neuroTaggerService: NeuroTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: NeuroTagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger.fields && this.data.tagger.fields.length > 0) {
      this.defaultDoc = `{ "${this.data.tagger.fields[0]}": " " }`;
    }
  }

  onSubmit(doc: string, threshold: number) {
    this.neuroTaggerService.tagDoc({ doc: JSON.parse(doc), threshold: threshold },
     this.data.currentProjectId, this.data.tagger.id)
    .subscribe((resp: { tags: { tag: string, probability: number }[]} | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse){
        this.logService.snackBarError(resp, 4000);
      }
    });
  }
}

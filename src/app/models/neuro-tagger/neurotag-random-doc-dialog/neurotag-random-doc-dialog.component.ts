import { Component, OnInit, Inject } from '@angular/core';
import { NeuroTaggerService } from 'src/app/core/neuro-tagger/neuro-tagger.service';
import { NeuroTagger } from 'src/app/shared/types/tasks/NeuroTagger';
import { MAT_DIALOG_DATA } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-neurotag-random-doc-dialog',
  templateUrl: './neurotag-random-doc-dialog.component.html',
  styleUrls: ['./neurotag-random-doc-dialog.component.scss']
})
export class NeurotagRandomDocDialogComponent implements OnInit {
  result: { document: any, result: {result: boolean, probability: number} };

  constructor(private neuroTaggerService: NeuroTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, neurotagger: NeuroTagger; }) {
  }

  ngOnInit() {
    this.onSubmit();
  }

  onSubmit() {
    this.neuroTaggerService.tagRandomDoc(this.data.currentProjectId, this.data.neurotagger.id)
    .subscribe((resp: any | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse){
        this.logService.snackBarError(resp, 4000);
      }
    })
  }
}

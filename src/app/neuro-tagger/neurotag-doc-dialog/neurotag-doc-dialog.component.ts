import { Component, OnInit, Inject } from '@angular/core';
import { NeuroTaggerService } from 'src/app/core/neuro-tagger/neuro-tagger.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { NeuroTagger } from 'src/app/shared/types/tasks/NeuroTagger';

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

  constructor(private neuroTaggerService: NeuroTaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: NeuroTagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger.fields_parsed && this.data.tagger.fields_parsed.length > 0) {
      this.defaultDoc = `{ "${this.data.tagger.fields_parsed[0]}": " " }`;
    }
  }

  onSubmit(doc: string, threshold: number) {
    this.neuroTaggerService.tagDoc({ doc: JSON.parse(doc), threshold: threshold },
     this.data.currentProjectId, this.data.tagger.id)
    .subscribe((resp: { tags: { tag: string, probability: number }[]}) => {
      this.result = resp;
    });
  }
}

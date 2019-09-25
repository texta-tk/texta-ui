import { Component, OnInit, Inject } from '@angular/core';
import { NeuroTaggerService } from 'src/app/core/neuro-tagger/neuro-tagger.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-neurotag-text-dialog',
  templateUrl: './neurotag-text-dialog.component.html',
  styleUrls: ['./neurotag-text-dialog.component.scss']
})
export class NeurotagTextDialogComponent {
  defaultThreshold = 0.3;
  result: { tags: { tag: string, probability: number }[]};
  options: any;

  constructor(private neuroTaggerService: NeuroTaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  onSubmit(value: string, threshold: number) {
    
    this.neuroTaggerService.tagText({text: value, threshold: threshold}, this.data.currentProjectId, this.data.taggerId)
      .subscribe((resp: { tags: { tag: string, probability: number }[]}) => {
      this.result = resp;
    });
  }
}

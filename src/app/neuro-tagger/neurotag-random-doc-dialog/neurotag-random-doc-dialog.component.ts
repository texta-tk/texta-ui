import { Component, OnInit, Inject } from '@angular/core';
import { NeuroTaggerService } from 'src/app/core/neuro-tagger/neuro-tagger.service';
import { NeuroTagger } from 'src/app/shared/types/tasks/NeuroTagger';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-neurotag-random-doc-dialog',
  templateUrl: './neurotag-random-doc-dialog.component.html',
  styleUrls: ['./neurotag-random-doc-dialog.component.scss']
})
export class NeurotagRandomDocDialogComponent implements OnInit {
  result: { document: any, result: {result: boolean, probability: number} };

  constructor(private neuroTaggerService: NeuroTaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, neurotagger: NeuroTagger; }) {
  }

  ngOnInit() {
    this.onSubmit();
  }

  onSubmit() {
    this.neuroTaggerService.tagRandomDoc(this.data.currentProjectId, this.data.neurotagger.id)
    .subscribe((result: any) => {
      this.result = result;
    })
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { TaggerGroupService } from 'src/app/core/taggers/tagger-group.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-tagger-group-tag-text-dialog',
  templateUrl: './tagger-group-tag-text-dialog.component.html',
  styleUrls: ['./tagger-group-tag-text-dialog.component.scss']
})
export class TaggerGroupTagTextDialogComponent {
  lemmatize = false;
  ner = false;
  results: { probability: number, tag: string, tagger_id: number }[] = [];

  constructor(private taggerGroupService: TaggerGroupService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  onSubmit(value) {
    this.taggerGroupService.tagText(
      {text: value, lemmatize: this.lemmatize, use_ner: this.ner}, this.data.currentProjectId, this.data.taggerId)
      .subscribe((resp: { probability: number, tag: string, tagger_id: number }[]) => {
      this.results = resp;
    });
  }


}

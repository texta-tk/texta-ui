import { Component, OnInit, Inject } from '@angular/core';
import { TaggerGroupService } from 'src/app/core/taggers/tagger-group.service';
import { TaggerGroup } from 'src/app/shared/types/tasks/Tagger';
import { MAT_DIALOG_DATA } from '@angular/material';

interface TaggerGroupRandomDocTag {
  ner_match: boolean;
  tag: string;
  probability: number;
  tagger_id: number;
}


interface TaggerGroupRandomDocResult   { 
  document: any;
  tags: TaggerGroupRandomDocTag[];
};

@Component({
  selector: 'app-tagger-group-tag-random-doc-dialog',
  templateUrl: './tagger-group-tag-random-doc-dialog.component.html',
  styleUrls: ['./tagger-group-tag-random-doc-dialog.component.scss']
})
export class TaggerGroupTagRandomDocDialogComponent implements OnInit {
  result: TaggerGroupRandomDocResult;


  isLoading = false;

  constructor(private taggerGroupService: TaggerGroupService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: TaggerGroup; }) {
  }

  ngOnInit() {
    this.onSubmit();
  }

  onSubmit() {
    this.isLoading = true;
    this.taggerGroupService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id)
    .subscribe((result: TaggerGroupRandomDocResult) => {
      this.result = result;
      this.isLoading = false;
    });
  }
}

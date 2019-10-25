import {Component, Inject, OnInit} from '@angular/core';
import {TaggerService} from 'src/app/core/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Tagger} from 'src/app/shared/types/tasks/Tagger';

@Component({
  selector: 'app-tag-random-doc-dialog',
  templateUrl: './tag-random-doc-dialog.component.html',
  styleUrls: ['./tag-random-doc-dialog.component.scss']
})
export class TagRandomDocDialogComponent implements OnInit {
  result: { document: any, result: { result: boolean, probability: number } };
  isLoading = false;

  constructor(private taggerService: TaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit() {
    this.onSubmit();
  }

  onSubmit() {
    this.isLoading = true;
    this.taggerService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id)
      .subscribe((result: any) => {
        this.result = result;
        this.isLoading = false;
      });
  }
}

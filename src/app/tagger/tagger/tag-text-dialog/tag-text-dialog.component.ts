import {Component, Input, Inject} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent {
  lemmatize: boolean;
  result: { result: boolean, probability: number };

  constructor(private taggerService: TaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  onSubmit(value) {
    this.taggerService.tagText({text: value, lemmatize: this.lemmatize}, this.data.currentProjectId, this.data.taggerId)
      .pipe(take(1)).subscribe((resp: { result: boolean, probability: number }) => {
      this.result = resp;
    });
  }
}

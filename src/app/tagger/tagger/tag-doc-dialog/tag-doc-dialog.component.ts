import {Component, OnInit, Inject} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {take} from 'rxjs/operators';
import {Tagger} from 'src/app/shared/types/tasks/Tagger';

@Component({
  selector: 'app-tag-doc-dialog',
  templateUrl: './tag-doc-dialog.component.html',
  styleUrls: ['./tag-doc-dialog.component.scss']
})
export class TagDocDialogComponent implements OnInit {
  lemmatize: boolean;
  defaultDoc;
  result: { result: boolean, probability: number };

  constructor(private taggerService: TaggerService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit(): void {
    if (this.data.tagger.fields_parsed && this.data.tagger.fields_parsed.length > 0) {
      this.defaultDoc = `{ "${this.data.tagger.fields_parsed[0]}": " " }`;
    }
  }

  onSubmit(doc) {
    this.taggerService.tagDocument({
      doc: JSON.parse(doc),
      lemmatize: this.lemmatize
    }, this.data.currentProjectId, this.data.tagger.id)
      .pipe(take(1)).subscribe((resp: { result: boolean, probability: number }) => {
      this.result = resp;
    });
  }
}

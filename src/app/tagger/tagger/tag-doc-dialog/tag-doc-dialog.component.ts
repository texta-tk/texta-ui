import { Component, OnInit } from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-tag-doc-dialog',
  templateUrl: './tag-doc-dialog.component.html',
  styleUrls: ['./tag-doc-dialog.component.scss']
})
export class TagDocDialogComponent implements OnInit {



  constructor(private dialogRef: MatDialogRef<TagDocDialogComponent>,
              private taggerService: TaggerService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    // get stopwords
  }

  onSubmit() {
    // post stopwords
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

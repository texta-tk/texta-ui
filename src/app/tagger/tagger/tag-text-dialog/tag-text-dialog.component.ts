import { Component, OnInit } from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit {



  constructor(private dialogRef: MatDialogRef<TagTextDialogComponent>,
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

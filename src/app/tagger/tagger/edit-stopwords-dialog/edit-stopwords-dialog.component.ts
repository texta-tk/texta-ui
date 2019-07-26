import {Component, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {CreateTaggerDialogComponent} from '../create-tagger-dialog/create-tagger-dialog.component';
import {ProjectStore} from '../../../core/projects/project.store';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-edit-stopwords-dialog',
  templateUrl: './edit-stopwords-dialog.component.html',
  styleUrls: ['./edit-stopwords-dialog.component.scss']
})
export class EditStopwordsDialogComponent implements OnInit {


  constructor(private dialogRef: MatDialogRef<EditStopwordsDialogComponent>,
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

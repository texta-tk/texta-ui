import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, ProjectIndex} from '../../../shared/types/Project';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {RegexTaggerGroup} from '../../../shared/types/tasks/RegexTaggerGroup';
import {filter, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit {
  result: { matches: unknown };
  isLoading = false;
  model: { text: string } = {text: ''};

  constructor(private regexTaggerGroupService: RegexTaggerGroupService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: RegexTaggerGroup; }) {
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        text: this.model.text
      };
      this.regexTaggerGroupService.tagText(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }
}

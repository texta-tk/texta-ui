import {ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {TorchTagger} from '../../../shared/types/tasks/TorchTagger';
import {ProjectIndex} from "../../../shared/types/Project";
import {Subject} from "rxjs";
import {ErrorStateMatcher} from "@angular/material/core";
import {LiveErrorStateMatcher} from "../../../shared/CustomerErrorStateMatchers";
import {filter, take} from "rxjs/operators";
import {HttpErrorResponse} from "@angular/common/http";
import {UtilityFunctions} from "../../../shared/UtilityFunctions";
import {Match} from "../../../shared/types/tasks/RegexTaggerGroup";

@Component({
  selector: 'app-tag-random-doc',
  templateUrl: './tag-random-doc.component.html',
  styleUrls: ['./tag-random-doc.component.scss']
})
export class TagRandomDocComponent implements OnInit {
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  fields: string[] = [];
  result: any;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  isLoading = false;

  constructor(private torchTaggerService: TorchTaggerService, private logService: LogService,
              private projectStore: ProjectStore,
              private changeDetectorRef: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: TorchTagger; }) {
  }
  taggerIdAccessor = (x: Match) => 'probability: ' + x.str_val;

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
        if (this.data.tagger.indices && this.data.tagger.fields) {
          const indices = this.projectIndices.filter(c => this.data.tagger.indices.some(y => y.name === c.index));
          if (indices.length > 0) {
            this.model.indices = indices;
            this.indicesOpenedChange(false); // refreshes the field and fact selection data
            this.model.fields = this.data.tagger.fields;
          }
        }
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x && this.model.indices.length === 0) {
        this.model.indices = x;
        if (this.model.fields.length === 0) {
          this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
        }
      }
    });
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.tagger) {
      this.isLoading = true;
      const body = {
        indices: this.model.indices.map(x => [{name: x.index}]).flat(),
        fields: this.model.fields
      };
      this.torchTaggerService.tagRandomDoc(this.data.currentProjectId, this.data.tagger.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = x;
          this.result.predictionTags = [this.result.prediction];
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  public indicesOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && this.model.indices && !UtilityFunctions.arrayValuesEqual(this.model.indices, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
    }
  }
}

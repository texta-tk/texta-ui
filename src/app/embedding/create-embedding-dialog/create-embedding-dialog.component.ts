import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CustomErrorStateMatcher} from '../../../shared/CustomErrorStateMatcher';
import {debounceTime, map, mergeMap, startWith, take} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectStore} from '../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-embedding-dialog.component.html',
  styleUrls: ['./create-embedding-dialog.component.scss']
})
export class CreateEmbeddingDialogComponent implements OnInit {
  // this is all temp because fields will be refactored
  embeddingForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    queryFormControl: new FormControl('"{\\"query\\": {\\"match_all\\": {}}}"', []),
    fieldsFormControl: new FormControl('', [Validators.required]),
    dimensionsFormControl: new FormControl(100, [Validators.required]),
    frequencyFormControl: new FormControl(5, [Validators.required])

  });

  matcher: ErrorStateMatcher = new CustomErrorStateMatcher();
  fields: unknown;
  filteredOptions: Observable<string[]>;

  constructor(private dialogRef: MatDialogRef<CreateEmbeddingDialogComponent>,
              private embeddingService: EmbeddingsService, private projectStore: ProjectStore) {

  }

  ngOnInit() {
    this.embeddingService.getEmbeddingsOptions().subscribe(resp => {
      if (resp) {
        this.fields = resp.actions.POST.fields.choices;
        this.filteredOptions = this.embeddingForm.get('fieldsFormControl').valueChanges
          .pipe(debounceTime(150),
            startWith(''),
            map(value => this._filter(value))
          );
      }
    });
  }

  onSubmit(formData) {
    const body = {
      description: formData.descriptionFormControl,
      query: formData.queryFormControl,
      fields: [formData.fieldsFormControl.value],
      num_dimensions: formData.dimensionsFormControl,
      min_freq: formData.frequencyFormControl
    };
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.embeddingService.createEmbedding(body, project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp) {
        this.dialogRef.close(resp);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  displayFn(value?: unknown): string | undefined {
    return value ? value.display_name : '';
  }

  private _filter(value: unknown): string[] {
    if (typeof value === 'object') {
      value = value.display_name;
    }

    const filterValue = value.toLowerCase();
    return this.fields.filter(option => option.display_name.toLowerCase().includes(filterValue));
  }
}

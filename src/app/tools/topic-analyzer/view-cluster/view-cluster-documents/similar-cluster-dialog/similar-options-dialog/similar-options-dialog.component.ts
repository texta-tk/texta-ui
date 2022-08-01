import {Component, Inject, OnInit} from '@angular/core';
import {TopicAnalyzerService} from '../../../../../../core/tools/topic-analyzer/topic-analyzer.service';
import {LogService} from '../../../../../../core/util/log.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../../../shared/CustomerErrorStateMatchers';

@Component({
  selector: 'app-similar-options-dialog',
  templateUrl: './similar-options-dialog.component.html',
  styleUrls: ['./similar-options-dialog.component.scss']
})
export class SimilarOptionsDialogComponent implements OnInit {
  optionsForm = new UntypedFormGroup({
    minTermFreqFormControl: new UntypedFormControl(1),
    maxQueryTermsFormControl: new UntypedFormControl(12),
    minDocFreqFormControl: new UntypedFormControl(5),
    minWordLengthFormControl: new UntypedFormControl(0),
    maxWordLengthFormControl: new UntypedFormControl(0),
    stopWordsFormControl: new UntypedFormControl(''),
    sizeFormControl: new UntypedFormControl(25, [Validators.max(10000)]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private clusterService: TopicAnalyzerService, private logService: LogService,
              private dialogRef: MatDialogRef<SimilarOptionsDialogComponent>,
              public dialog: MatDialog,
              // tslint:disable-next-line:no-any
              @Inject(MAT_DIALOG_DATA) public data: { options: any }) {
    if (this.data.options != null) {
      this.optionsForm.get('minTermFreqFormControl')?.setValue(this.data.options.min_term_freq);
      this.optionsForm.get('maxQueryTermsFormControl')?.setValue(this.data.options.max_query_terms);
      this.optionsForm.get('minDocFreqFormControl')?.setValue(this.data.options.min_doc_freq);
      this.optionsForm.get('minWordLengthFormControl')?.setValue(this.data.options.min_word_length);
      this.optionsForm.get('maxWordLengthFormControl')?.setValue(this.data.options.max_word_length);
      this.optionsForm.get('sizeFormControl')?.setValue(this.data.options.size);
      if (this.data.options.stop_words) {
        this.optionsForm.get('stopWordsFormControl')?.setValue(this.data.options.stop_words.join(',').replace(',', '\n'));
      }

    }
  }

  ngOnInit(): void {
  }

  onSubmit(formData: {
    minTermFreqFormControl: number; maxQueryTermsFormControl: number; minDocFreqFormControl: number;
    minWordLengthFormControl: number; maxWordLengthFormControl: number; sizeFormControl: number;
    stopWordsFormControl: string;
  }): void {
    const body = {
      min_term_freq: formData.minTermFreqFormControl ? formData.minTermFreqFormControl : 1,
      max_query_terms: formData.maxQueryTermsFormControl ? formData.maxQueryTermsFormControl : 12,
      min_doc_freq: formData.minDocFreqFormControl ? formData.minDocFreqFormControl : 5,
      min_word_length: formData.minWordLengthFormControl ? formData.minWordLengthFormControl : 0,
      max_word_length: formData.maxWordLengthFormControl ? formData.maxWordLengthFormControl : 0,
      size: formData.sizeFormControl ? formData.sizeFormControl : 25,
      include_meta: true,
      stop_words: formData.stopWordsFormControl ? formData.stopWordsFormControl.split('\n').filter((x: string) => !!x) : [],
    };
    this.dialogRef.close(body);
  }

}

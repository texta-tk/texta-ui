import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {CoreService} from '../../../core/core.service';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-apply-stemmer-text-dialog',
  templateUrl: './apply-stemmer-text-dialog.component.html',
  styleUrls: ['./apply-stemmer-text-dialog.component.scss']
})
export class ApplyStemmerTextDialogComponent implements OnInit {
  stemmerForm = new FormGroup({
    text: new FormControl('', [Validators.required]),
    language: new FormControl('', [Validators.required]),
  });
  matcher = new LiveErrorStateMatcher();
  languages: string[] = [];
  isLoading: boolean;
  result: { text: string, language: string } | undefined;

  constructor(private coreService: CoreService, private logService: LogService) {
  }

  ngOnInit(): void {
    this.coreService.getSnowballLanguages().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.languages = resp.filter(x => !!x).sort();
      } else {
        this.logService.snackBarError(resp);
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.coreService.postSnowballStemmer({
      text: this.stemmerForm.value.text,
      language: this.stemmerForm.value.language,
    }).subscribe(resp => {
      this.isLoading = false;
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else {
        this.logService.snackBarError(resp);
      }
    });
  }
}

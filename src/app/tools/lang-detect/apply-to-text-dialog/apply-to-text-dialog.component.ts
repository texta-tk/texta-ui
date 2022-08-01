import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {CoreService} from '../../../core/core.service';
import {LogService} from '../../../core/util/log.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-apply-to-text-dialog',
  templateUrl: './apply-to-text-dialog.component.html',
  styleUrls: ['./apply-to-text-dialog.component.scss']
})
export class ApplyToTextDialogComponent implements OnInit {
  applyForm = new FormGroup({
    text: new FormControl('', [Validators.required]),
  });
  matcher = new LiveErrorStateMatcher();
  languages: string[] = [];
  isLoading: boolean;
  result: { text: string; language_code: string; language: string } | undefined;

  constructor(private coreService: CoreService, private logService: LogService) {
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.isLoading = true;
    if (this.applyForm.value.text) {
      this.coreService.detectLanguageMLP(this.applyForm.value.text).subscribe(resp => {
        this.isLoading = false;
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp;
        } else {
          this.logService.snackBarError(resp);
        }
      });
    }
  }
}

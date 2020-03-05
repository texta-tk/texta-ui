import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CrossFieldErrorMatcher, LiveErrorStateMatcher} from '../../../CustomerErrorStateMatchers';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {UserService} from '../../../../core/users/user.service';
import {LocalStorageService} from '../../../../core/util/local-storage.service';
import {UserStore} from '../../../../core/users/user.store';
import {Router} from '@angular/router';
import {mergeMap} from 'rxjs/operators';
import {UserAuth} from '../../../types/UserAuth';
import {HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {UserProfile} from '../../../types/UserProfile';



function passwordMatchValidator(g: FormGroup) {
  const password1 = g.get('passwordFormControl');
  const password2 = g.get('passwordConfirmFormControl');
  return (password1 && password2 && password1.value === password2.value)
    ? null : {mismatch: true};
}

@Component({
  selector: 'app-registration-dialog',
  templateUrl: './registration-dialog.component.html',
  styleUrls: ['./registration-dialog.component.scss']
})
export class RegistrationDialogComponent implements OnInit, OnDestroy {

  profileForm = new FormGroup({
    usernameFormControl: new FormControl('', [
      Validators.required,
    ]),
    emailFormControl: new FormControl('', Validators.email),
    passwordForm: new FormGroup({
      passwordFormControl: new FormControl('', [
        Validators.minLength(8), Validators.required
      ]),
      passwordConfirmFormControl: new FormControl('', [Validators.required])
    }, passwordMatchValidator),

  });

  matcher = new LiveErrorStateMatcher();
  crossFieldMatcher = new CrossFieldErrorMatcher();
  registrationError = '';
  makingRequest = false;

  constructor(
    public dialogRef: MatDialogRef<RegistrationDialogComponent>,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private userStore: UserStore,
    @Inject(MAT_DIALOG_DATA) public data: { returnUrl: string },
    private router: Router) {
  }


  ngOnInit() {
  }

  ngOnDestroy() {

  }

  onSubmit(formData) {
    const body = {
      username: formData.usernameFormControl,
      // email: formData.emailFormControl,
      password1: formData.passwordForm.passwordFormControl,
      password2: formData.passwordForm.passwordConfirmFormControl
    };
    this.registrationError = '';
    this.makingRequest = true;
    this.userService.register(body).pipe(
      mergeMap((response: UserAuth | HttpErrorResponse) => {
        this.makingRequest = false;
        if (response instanceof HttpErrorResponse) {
          // blink effect with timeout
          setTimeout(() => {
            if (response.error.password1) {
              this.registrationError = response.error.password1;
            } else if (response.error.username) {
              this.registrationError = response.error.username;
            }
          }, 100);
          return of(null);
        } else {
          // success, save token
          this.localStorageService.setUser(response);
          return this.userService.getUserProfile();
        }
      })).subscribe((resp: UserProfile | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.userStore.setCurrentUser(resp);
        if (this.data) {
          // user wanted to access settings for example, so direct to settings
          this.router.navigate([this.data.returnUrl]).finally((() => this.closeDialog()));
        } else {
          // navigate to home page
          this.router.navigate(['']).finally((() => this.closeDialog()));

        }

      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

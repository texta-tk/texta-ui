import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {LiveErrorStateMatcher} from '../../../CustomerErrorStateMatchers';
import {HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../../../../core/util/local-storage.service';
import {UserStore} from '../../../../core/users/user.store';
import {UserService} from '../../../../core/users/user.service';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {UserProfile} from '../../../types/UserProfile';
import {Router} from '@angular/router';
import {UserAuth} from '../../../types/UserAuth';


@Component({
  selector: 'app-login',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit, OnDestroy {

  profileForm = new FormGroup({
    usernameFormControl: new FormControl('', [
      Validators.required,
    ]),
    passwordFormControl: new FormControl('', [
      Validators.required,
    ])
  });
  public hide = true;
  matcher = new LiveErrorStateMatcher();
  loginError = '';
  makingRequest = false;


  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private userStore: UserStore,
    @Inject(MAT_DIALOG_DATA) public data: { returnUrl: string },
    private router: Router) {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

  onSubmit(formData) {
    this.loginError = '';
    this.makingRequest = true;
    this.userService.authenticate(formData.usernameFormControl, formData.passwordFormControl).pipe(
      mergeMap((response: UserAuth | HttpErrorResponse) => {
        this.makingRequest = false;
        if (response instanceof HttpErrorResponse) {
          // blink effect with timeout
          setTimeout(() => this.loginError = response.error.non_field_errors, 100);
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

  ngOnDestroy() {

  }
}

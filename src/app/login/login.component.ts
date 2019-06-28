import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CustomErrorStateMatcher} from '../../shared/CustomErrorStateMatcher';
import {HttpErrorResponse} from '@angular/common/http';
import {LocalstorageService} from '../core/util/localstorage.service';
import {UserStore} from '../core/user.store';
import {UserService} from '../core/user.service';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {UserProfile} from '../../shared/types/UserProfile';
import {Router} from '@angular/router';
import {UserAuth} from '../../shared/types/UserAuth';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  profileForm = new FormGroup({
    emailFormControl: new FormControl('', [
      Validators.required,
    ]),
    passwordFormControl: new FormControl('', [
      Validators.required,
    ])
  });
  public hide = true;
  matcher = new CustomErrorStateMatcher();
  loginError = undefined;
  makingRequest = false;


  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    private userService: UserService,
    private localStorageService: LocalstorageService,
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
    this.userService.authenticate(formData.emailFormControl, formData.passwordFormControl).pipe(
      mergeMap((response: UserAuth | HttpErrorResponse) => {
        this.makingRequest = false;
        if (response instanceof HttpErrorResponse) {
          // blink effect with timeout
          setTimeout(() => this.loginError = response.error.non_field_errors, 100);
          return of(null);
        } else {
          // success, save token
          this.localStorageService.setUser(response);
          // return getprofile observable
          return this.userService.getUserProfile();
        }
      })).subscribe((resp: UserProfile | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.userStore.setCurrentUser(resp);
        if (this.data.returnUrl) {
          this.router.navigate([this.data.returnUrl]).finally((() => this.closeDialog()));
        } else {
          this.closeDialog();
        }

      }


    });
  }

  ngOnDestroy() {

  }
}

import {Component, Inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {LiveErrorStateMatcher} from '../../../CustomerErrorStateMatchers';
import {HttpErrorResponse} from '@angular/common/http';
import {LocalStorageService} from '../../../../core/util/local-storage.service';
import {UserStore} from '../../../../core/users/user.store';
import {UserService} from '../../../../core/users/user.service';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {UserAuth} from '../../../types/UserAuth';
import {RegistrationDialogComponent} from '../registration/registration-dialog.component';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-login',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent {

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
  allowUAA = environment.useCloudFoundryUAA;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private userService: UserService,
    private localStorageService: LocalStorageService,
    private userStore: UserStore,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { returnUrl: string },
    private router: Router) {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onLoginWithCF(): void {
    // TODO replace with some env var
    window.location.href = 'http://localhost:8080/uaa/oauth/authorize?response_type=code&client_id=login&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fv1%2Fuaa%2Fcallback';
  }

  registerDialog(): void {
    this.dialogRef.close();
    this.dialog.open(RegistrationDialogComponent, {
      maxHeight: '450px',
      width: '400px',
    });
  }

  onSubmit(formData: { usernameFormControl: string; passwordFormControl: string; }): void {
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
      })).subscribe(resp => {
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
}

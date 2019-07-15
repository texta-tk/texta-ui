import {Component, OnInit, OnDestroy} from '@angular/core';
import {UserProfile} from '../shared/types/UserProfile';
import {UserStore} from '../core/users/user.store';
import {Subscription} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {UserService} from '../core/users/user.service';
import {CrossFieldErrorMatcher, LiveErrorStateMatcher} from '../shared/CustomerErrorStateMatchers';

function passwordMatchValidator(g: FormGroup) {
  return g.get('passwordFormControl').value === g.get('passwordConfirmFormControl').value
    ? null : {mismatch: true};
}

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  user: UserProfile;
  userSubscription: Subscription;
  detail: string;
  forgotPasswordForm = new FormGroup({
    emailFormControl: new FormControl('', [
      Validators.required, Validators.email
    ]),
  });

  passwordResetForm = new FormGroup({
    passwordForm: new FormGroup({
      passwordFormControl: new FormControl('', [
        Validators.minLength(8), Validators.required
      ]),
      passwordConfirmFormControl: new FormControl('', [Validators.required])
    }, passwordMatchValidator),
    oldPasswordFormControl: new FormControl('', Validators.required)

  });

  matcher = new LiveErrorStateMatcher();
  crossFieldMatcher = new CrossFieldErrorMatcher();

  constructor(private userStore: UserStore, private userService: UserService) {

  }

  public onPasswordResetFormSubmit(formData: any) {
    console.log(formData);
    const body = {
      new_password1: formData.passwordForm.passwordFormControl,
      new_password2: formData.passwordForm.passwordConfirmFormControl
    };
    this.userService.changePassword(body).subscribe((resp: any) => {
      console.log(resp);
      this.detail = resp.detail;
    });
  }

  public onForgotPasswordFormSubmit(formData: any) {
    console.log(formData);
    this.userService.resetPassword(formData.emailFormControl).subscribe((resp: any) => {
      console.log(resp);
      this.detail = resp.detail;
    });
  }

  ngOnInit() {
    this.userSubscription = this.userStore.getCurrentUser().subscribe(resp => {
      if (resp) {
        this.user = resp;
      }
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

}

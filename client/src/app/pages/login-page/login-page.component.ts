import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthErrors } from '@app/pages/login-page/auth-errors';
import { AuthService } from '@app/services/auth.service';
import { first } from 'rxjs/operators';

@Component({
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
    });
    constructor(private authService: AuthService, private router: Router) {}

    login() {
        if (!this.isEmailFormValid || !this.isPasswordFormValid) {
            return;
        }

        const result = this.authService.login(this.loginForm.value);
        result.pipe(first()).subscribe(
            () => {
                this.router.navigate(['/home']);
            },
            (httpError) => {
                const {
                    error: { errors },
                } = httpError;
                if (!errors) {
                    return;
                }
                errors.forEach((error: string) => {
                    if (error === AuthErrors.EmailNotFound) {
                        this.loginForm.controls.email.setErrors({ notFound: true });
                    }

                    if (error === AuthErrors.InvalidPassword) {
                        this.loginForm.controls.password.setErrors({ invalid: true });
                    }
                });
            },
        );
    }

    get isEmailFormValid() {
        return !this.loginForm.controls.email.hasError('email') || this.loginForm.controls.email.hasError('required');
    }

    get isEmailValid() {
        return !this.loginForm.controls.email.hasError('notFound');
    }

    get isPasswordFormValid() {
        return !this.loginForm.controls.password.hasError('required');
    }

    get isPasswordValid() {
        return !this.loginForm.controls.password.hasError('invalid');
    }
}
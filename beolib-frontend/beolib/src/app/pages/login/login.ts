import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { getApiErrorMessage } from '../../utils/api-error.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  /** Polja prema backend LoginRequest: email, password */
  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') === 'true') {
      this.successMessage.set('Registracija uspešna, uloguj se.');
    }
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/books']);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error, 'Neispravan email ili lozinka.'));
        },
      });
  }
}

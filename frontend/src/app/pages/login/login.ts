import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Correo o contraseña incorrectos. Por favor, verifica tus datos.';
        this.cdr.detectChanges(); // Fuerza la aparición instantánea
      }
    });
  }
}

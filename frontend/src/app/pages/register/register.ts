import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  form: FormGroup;
  error = '';
  success = '';
  loading = false;

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre:   ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    this.success = '';
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.success = '¡Registro exitoso! Ya puedes iniciar sesión. Redirigiendo...';
        this.cdr.detectChanges(); // Fuerza la aparición instantánea
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error capturado:', err);
        this.error = err.error?.error || 'El correo ya está registrado o hay un error de conexión';
        this.cdr.detectChanges(); // Fuerza la aparición instantánea
      }
    });
  }
}

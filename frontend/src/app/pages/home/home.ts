import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InventarioService, Material, Categoria } from '../../services/inventario.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styles: [`
    .dashboard { padding: 2rem; max-width: 1100px; margin: 0 auto; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #fafafa; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; border-bottom: 2px solid #eee; padding-bottom: 1rem; }
    .header h1 { color: #1a202c; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.025em; }
    .actions { display: flex; gap: 0.75rem; }
    
    table { width: 100%; border-collapse: separate; border-spacing: 0; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    th, td { padding: 1.25rem 1rem; text-align: left; }
    th { background: #f7fafc; font-weight: 700; color: #4a5568; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid #edf2f7; }
    td { border-bottom: 1px solid #edf2f7; color: #2d3748; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #fbfcfe; }

    .alert-row td { background: #fff5f5 !important; }
    .badge { padding: 0.35rem 0.65rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
    .badge-error { background: #feb2b2; color: #9b2c2c; }
    .badge-success { background: #c6f6d5; color: #22543d; }

    button { padding: 0.2rem 1.0rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid #e2e8f0; background: white; color: #4a5568; font-size: 0.85rem; }
    button:hover { background: #edf2f7; transform: translateY(-1px); }
    .btn-dark { background: #1a202c; color: white; border: none; }
    .btn-pdf { background: #2f855a; color: white; border: none; }
    .btn-refresh { background: #3182ce; color: white; border: none; }
    .btn-danger { background: #e53e3e; color: white; border: none; }

    .form-box { background: white; padding: 2rem; border-radius: 12px; margin-bottom: 2.5rem; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .grid { display: grid; grid-template-cols: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
    input, select { padding: 0.75rem; border-radius: 8px; border: 1px solid #e2e8f0; width: 100%; outline: none; }
    
    .cat-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }
    .cat-item { background: #edf2f7; padding: 0.4rem 0.8rem; border-radius: 20px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
    .cat-del { color: #e53e3e; cursor: pointer; font-weight: bold; }
  `]
})
export class HomePage implements OnInit {
  materiales: Material[] = [];
  categorias: Categoria[] = [];
  historial: any[] = [];

  nuevo = { nombre: '', categoria: '', unidad: 'unidades', alertaMinima: 5 };
  nuevaCat = { nombre: '' };
  editando: Material | null = null;
  movimiento = { materialId: '', tipo: 'entrada', cantidad: 0, motivo: '', empresa: '', persona: '', fecha: new Date().toISOString().split('T')[0] };

  // Edición de perfil de usuario
  mostrarEditarPerfil = false;
  perfilEditando = { nombre: '', email: '' };
  perfilGuardando = false;
  perfilMensaje = '';
  nombreUsuario = '';

  mostrarFormMaterial = false;
  mostrarFormMov = false;
  mostrarCategorias = false;
  mostrarHistorial = false;

  constructor(
    private auth: AuthService,
    private inv: InventarioService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cargar();
    this.cargarCategorias();
    this.cargarHistorial();
    this.cargarUsuarioActual();
  }

  cargarUsuarioActual() {
    const payload = this.auth.getTokenPayload();
    if (payload && payload.id) {
      this.auth.getUser(payload.id).subscribe((u: any) => {
        this.nombreUsuario = u.nombre || '';
        this.cdr.detectChanges();
      });
    }
  }

  cargar() {
    this.inv.getMateriales().subscribe(m => {
      this.materiales = m;
      this.cdr.detectChanges();
    });
  }

  cargarHistorial() {
    this.inv.getMovimientos().subscribe(h => {
      this.historial = h;
      this.cdr.detectChanges();
    });
  }

  cargarCategorias() {
    this.inv.getCategorias().subscribe({
      next: (c) => {
        this.categorias = c;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorias:', err)
    });
  }

  crearCategoria() {
    if (!this.nuevaCat.nombre) return;
    console.log('Creando categoría:', this.nuevaCat.nombre);
    this.inv.crearCategoria(this.nuevaCat).subscribe(() => {
      this.cargarCategorias();
      this.nuevaCat.nombre = '';
      this.cdr.detectChanges();
    });
  }

  eliminarCategoria(id: string) {
    if (confirm('¿Eliminar esta categoría?')) {
      this.inv.eliminarCategoria(id).subscribe(() => this.cargarCategorias());
    }
  }

  abrirEditar(m: Material) {
    this.editando = { ...m };
    this.mostrarFormMaterial = true;
  }

  guardarMaterial() {
    if (this.editando && this.editando._id) {
      this.inv.actualizarMaterial(this.editando._id, this.editando).subscribe(() => {
        this.cargar();
        this.cancelarEdicion();
      });
    } else {
      this.inv.crearMaterial(this.nuevo).subscribe(() => {
        this.cargar();
        this.nuevo = { nombre: '', categoria: '', unidad: 'unidades', alertaMinima: 5 };
        this.mostrarFormMaterial = false;
      });
    }
  }

  eliminarMaterial(id: string) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.inv.eliminarMaterial(id).subscribe(() => this.cargar());
    }
  }

  cancelarEdicion() {
    this.editando = null;
    this.mostrarFormMaterial = false;
  }

  abrirMovimiento(m: Material) {
    this.movimiento.materialId = m._id!;
    this.mostrarFormMov = true;
    this.cdr.detectChanges();
  }

  registrarMovimiento() {
    if (!this.movimiento.materialId || this.movimiento.cantidad <= 0) {
      alert('Por favor ingrese una cantidad válida.');
      return;
    }
    const userToken = this.auth.getToken();
    if (!userToken) {
      alert('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
      this.logout();
      return;
    }

    try {
      const decoded = JSON.parse(atob(userToken.split('.')[1]));
      const userName = decoded.nombre || decoded.email || 'Admin';

      this.inv.registrarMovimiento({ ...this.movimiento, usuario: userName }).subscribe({
        next: () => {
          alert('¡Movimiento registrado con éxito!');
          this.cargar();
          this.cargarHistorial();
          this.movimiento = {
            materialId: '',
            tipo: 'entrada',
            cantidad: 0,
            motivo: '',
            empresa: '',
            persona: '',
            fecha: new Date().toISOString().split('T')[0]
          };
          this.mostrarFormMov = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al registrar movimiento:', err);
          const msg = err.error?.error || 'No se pudo registrar el movimiento. Verifica los datos.';
          alert('Error: ' + msg);
        }
      });
    } catch (e) {
      console.error('Error al decodificar token:', e);
      alert('Error de sesión. Por favor, reingresa al sistema.');
    }
  }

  descargarPDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Inventario Total', 14, 15);
    const data = this.materiales.map(m => [m.nombre, m.categoria, m.stock, m.unidad, m.stock <= m.alertaMinima ? 'BAJO STOCK' : 'OK']);
    autoTable(doc, { startY: 20, head: [['Nombre', 'Categoría', 'Stock', 'Unidad', 'Estado']], body: data });
    doc.save('inventario-total.pdf');
  }

  descargarPDFMovimientos() {
    this.inv.getMovimientos().subscribe({
      next: (movs) => {
        if (!movs || movs.length === 0) {
          alert('Aún no hay movimientos registrados para generar el reporte.');
          return;
        }

        try {
          const doc = new jsPDF();
          doc.text('Historial de Entradas y Salidas', 14, 15);

          const data = movs.map(m => [
            m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
            m.materialId ? (m.materialId.nombre || 'Material eliminado') : 'N/A',
            (m.tipo || 'N/A').toUpperCase(),
            m.cantidad || 0,
            m.empresa || '-',
            m.persona || '-',
            m.motivo || '-',
            m.usuario || 'N/A'
          ]);

          autoTable(doc, {
            startY: 20,
            head: [['Fecha', 'Material', 'Tipo', 'Cant.', 'Empresa', 'Persona', 'Motivo', 'Usuario']],
            body: data,
          });

          doc.save('historial-movimientos.pdf');
        } catch (e) {
          console.error('Error generando PDF:', e);
          alert('Error al generar el PDF. Verifica la consola del navegador.');
        }
      },
      error: (err) => {
        console.error('Error al obtener movimientos:', err);
        alert('Hubo un error al conectar con el servidor para obtener los movimientos.');
      }
    });
  }

  // ── Editar perfil ──────────────────────────────────────────
  abrirEditarPerfil() {
    const payload = this.auth.getTokenPayload();
    if (!payload?.id) { alert('No se pudo obtener la información de la sesión.'); return; }
    // Pre-rellena con lo que hay en el token mientras carga
    this.perfilEditando = { nombre: '', email: payload.email || '' };
    this.perfilMensaje = 'Cargando datos...';
    this.mostrarEditarPerfil = true;
    this.cdr.detectChanges();
    
    // Obtiene los datos frescos del servidor
    this.auth.getUser(payload.id).subscribe({
      next: (u) => {
        this.perfilEditando = { nombre: u.nombre || '', email: u.email || '' };
        this.perfilMensaje = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.perfilMensaje = '⚠️ No se pudo cargar el perfil. Edita los datos manualmente.';
        this.cdr.detectChanges();
      }
    });
  }

  guardarPerfil() {
    const payload = this.auth.getTokenPayload();
    if (!payload?.id) { alert('No se encontró el ID del usuario en la sesión.'); return; }
    if (!this.perfilEditando.nombre.trim() || !this.perfilEditando.email.trim()) {
      this.perfilMensaje = 'El nombre y el email son obligatorios.';
      return;
    }
    this.perfilGuardando = true;
    this.perfilMensaje = '';
    this.auth.updateUser(payload.id, this.perfilEditando).subscribe({
      next: (res: any) => {
        console.log('Respuesta del servidor al actualizar perfil:', res);
        this.perfilGuardando = false;
        this.perfilMensaje = '✅ Perfil actualizado correctamente.';
        this.nombreUsuario = res?.nombre || this.perfilEditando.nombre;
        this.cdr.detectChanges();

        // Forzar la actualización visual
        setTimeout(() => {
          this.mostrarEditarPerfil = false;
          this.perfilMensaje = '';
          this.cdr.detectChanges();
        }, 1500);
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.perfilGuardando = false;
        this.perfilMensaje = '❌ Error: ' + (err?.error?.error || err.message || 'No se pudo actualizar el perfil.');
        this.cdr.detectChanges();
      }
    });
  }

  cancelarEditarPerfil() {
    this.mostrarEditarPerfil = false;
    this.perfilMensaje = '';
  }
  eliminarCuenta() {
    const payload = this.auth.getTokenPayload();
    if (!payload?.id) { alert('No se pudo obtener el ID del usuario.'); return; }
    if (!confirm('⚠️ ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    this.auth.deleteUser(payload.id).subscribe({
      next: () => {
        alert('Cuenta eliminada correctamente.');
        this.auth.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert('❌ Error al eliminar la cuenta: ' + (err.error?.error || 'Inténtalo de nuevo.'));
      }
    });
  }
  // ───────────────────────────────────────────────────────────

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

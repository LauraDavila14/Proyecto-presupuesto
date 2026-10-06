import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SelectionColumn, SelectionSideNavComponent } from '../../../../../shared/components/selection-side-nav/selection-side-nav.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { RadioComponent, RadioOption } from '../../../../../shared/ui/radio/radio.component';
import { SnackbarComponent, SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { PROCESS_ROUTE } from '../../config/clasificador-programatico.rutas';
import { CATALOGO_ESTRUCTURAS, EstructuraClasificador, RegistroClasificador, TIPOS_CLASIFICADOR, nombreTipoClasificador } from '../../models/clasificador-programatico.model';

/** Lo que se llena en «Registrar estructura» (vacío al empezar). */
interface FormularioRegistro {
  codigo: string;
  denominacion: string;
  tipoClasificador: string;
  fechaVigencia: string;
}

const FORMULARIO_VACIO: FormularioRegistro = { codigo: '', denominacion: '', tipoClasificador: '', fechaVigencia: '' };

type TipoIngreso = 'buscar' | 'registrar';

/**
 * Solicitud de clasificador programático (tipo de acción «Creación»; nodo de Figma 406:10759, panel «Registro de clasificador»
 * 726:19845): pantalla de ejemplo del taller. Los registros que agrega el usuario viven en memoria de este
 * componente — no hay solicitud real, backend simulado ni persistencia: «Grabar» solo confirma con un aviso y
 * «Verificar y enviar» queda deshabilitado, porque no hay un flujo de aprobación detrás.
 *
 * El panel «Registro de clasificador» tiene dos formas de cargar una fila:
 * - **Buscar estructura** (por defecto): elige una estructura ya existente del catálogo con `siaf-selection-side-nav`.
 * - **Registrar estructura**: la llena a mano (código, denominación, tipo y fecha de vigencia).
 */
@Component({
  selector: 'siaf-clasificador-programatico-request',
  standalone: true,
  imports: [
    ButtonComponent,
    DateTimePickerComponent,
    RadioComponent,
    SelectionSideNavComponent,
    SnackbarComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TextFieldComponent,
  ],
  templateUrl: './clasificador-programatico-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClasificadorProgramaticoRequestComponent {
  private readonly router = inject(Router);
  private readonly currentUser = inject(CurrentUserService);

  readonly heading = 'Solicitud de clasificador programático';
  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/panel' },
    { label: 'Crear Documento', href: PROCESS_ROUTE },
    { label: 'Clasificador programático' },
  ];
  readonly tiposClasificador = TIPOS_CLASIFICADOR;

  readonly camposEntidad = computed<SolicitudeInfoField[]>(() => {
    const usuario = this.currentUser.user();
    return [
      { label: 'Fecha', value: '' },
      { label: 'Unidad ejecutora', value: (usuario.unidad ?? usuario.office).toUpperCase() },
    ];
  });

  // ── Registros agregados ──────────────────────────────────────────
  readonly registros = signal<RegistroClasificador[]>([]);
  private correlativo = 0;

  readonly saveDisabled = computed(() => this.registros().length === 0);
  // Sin flujo de aprobación real: «Verificar y enviar» siempre deshabilitado.
  readonly verifyDisabled = true;

  // ── Panel «Registro de clasificador» ──────────────────────────────
  readonly agregando = signal(false);

  readonly opcionesEstructura: RadioOption[] = [
    { label: 'Buscar estructura', value: 'buscar' },
    { label: 'Registrar estructura', value: 'registrar' },
  ];
  readonly tipoIngreso = signal<TipoIngreso>('buscar');

  // «Buscar estructura»: catálogo + side-nav de selección.
  readonly panelBusquedaAbierto = signal(false);
  readonly busqueda = signal('');
  readonly estructuraSeleccionada = signal<EstructuraClasificador | null>(null);
  /** Selección temporal dentro del side-nav, mientras no se confirma con su «Aceptar». */
  private readonly tempSeleccionId = signal<string | null>(null);
  readonly tempSeleccionIds = computed<string[]>(() => (this.tempSeleccionId() ? [this.tempSeleccionId()!] : []));

  readonly estructurasFiltradas = computed<EstructuraClasificador[]>(() => {
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return CATALOGO_ESTRUCTURAS;
    return CATALOGO_ESTRUCTURAS.filter(
      (e) => e.codigo.toLowerCase().includes(texto) || e.denominacion.toLowerCase().includes(texto),
    );
  });

  readonly columnasEstructura: SelectionColumn<EstructuraClasificador>[] = [
    { key: 'codigo', label: 'Código', widthClass: 'w-[100px]' },
    { key: 'denominacion', label: 'Denominación' },
    { key: 'tipoClasificador', label: 'Tipo', widthClass: 'w-[140px]', render: (row) => nombreTipoClasificador(row.tipoClasificador) },
    { key: 'fechaVigencia', label: 'Vigencia', widthClass: 'w-[120px]', render: (row) => row.fechaVigencia.split('-').reverse().join('/') },
  ];

  // «Registrar estructura»: formulario manual.
  readonly formulario = signal<FormularioRegistro>({ ...FORMULARIO_VACIO });

  readonly puedeAceptar = computed(() => {
    if (this.tipoIngreso() === 'buscar') return !!this.estructuraSeleccionada();
    const f = this.formulario();
    return !!f.codigo.trim() && !!f.denominacion.trim() && !!f.tipoClasificador && !!f.fechaVigencia;
  });

  // ── Aviso ──────────────────────────────────────────────────────────
  readonly avisoAbierto = signal(false);
  readonly aviso = signal<SnackbarVariant>('record-done');

  actualizar<K extends keyof FormularioRegistro>(campo: K, valor: FormularioRegistro[K]): void {
    this.formulario.update((f) => ({ ...f, [campo]: valor }));
  }

  cambiarTipoIngreso(valor: TipoIngreso): void {
    this.tipoIngreso.set(valor);
  }

  abrirPanel(): void {
    this.tipoIngreso.set('buscar');
    this.estructuraSeleccionada.set(null);
    this.busqueda.set('');
    this.formulario.set({ ...FORMULARIO_VACIO });
    this.agregando.set(true);
  }

  cerrarPanel(): void {
    this.agregando.set(false);
  }

  abrirBusqueda(): void {
    this.tempSeleccionId.set(this.estructuraSeleccionada()?.id ?? null);
    this.panelBusquedaAbierto.set(true);
  }

  cerrarBusqueda(): void {
    this.panelBusquedaAbierto.set(false);
  }

  onCambioSeleccionBusqueda(ids: string[]): void {
    this.tempSeleccionId.set(ids[0] ?? null);
  }

  onAceptarBusqueda(ids: string[]): void {
    const id = ids[0];
    this.estructuraSeleccionada.set(CATALOGO_ESTRUCTURAS.find((e) => e.id === id) ?? null);
    this.panelBusquedaAbierto.set(false);
  }

  confirmarRegistro(): void {
    if (!this.puedeAceptar()) return;

    this.correlativo += 1;
    const id = `reg-${this.correlativo}`;

    if (this.tipoIngreso() === 'buscar') {
      const e = this.estructuraSeleccionada();
      if (!e) return;
      this.registros.update((registros) => [
        ...registros,
        { id, codigo: e.codigo, denominacion: e.denominacion, tipoClasificador: e.tipoClasificador, fechaVigencia: e.fechaVigencia },
      ]);
    } else {
      const f = this.formulario();
      this.registros.update((registros) => [
        ...registros,
        { id, codigo: f.codigo.trim(), denominacion: f.denominacion.trim(), tipoClasificador: f.tipoClasificador, fechaVigencia: f.fechaVigencia },
      ]);
    }

    this.agregando.set(false);
    this.mostrarAviso('record-done');
  }

  quitarRegistro(id: string): void {
    this.registros.update((registros) => registros.filter((r) => r.id !== id));
  }

  grabar(): void {
    if (this.saveDisabled()) return;
    this.mostrarAviso('changes-saved');
  }

  regresar(): void {
    void this.router.navigate([PROCESS_ROUTE]);
  }

  nombreTipo(codigo: string): string {
    return nombreTipoClasificador(codigo);
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }
}

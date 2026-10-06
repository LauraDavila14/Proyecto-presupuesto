import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { SelectionColumn, SelectionSideNavComponent } from '../../../../../shared/components/selection-side-nav/selection-side-nav.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { RadioComponent, RadioOption } from '../../../../../shared/ui/radio/radio.component';
import { SnackbarComponent, SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { PROCESS_ROUTE } from '../../config/clasificador-programatico.rutas';
import {
  CAMPOS_ESTRUCTURA,
  CATEGORIAS_PRESUPUESTARIAS,
  CampoEstructura,
  ItemEstructura,
  PROCESOS_CLASIFICADOR,
  RegistroClasificador,
  nombreProcesos,
} from '../../models/clasificador-programatico.model';

/**
 * Solicitud de clasificador programático, tipo de acción «Creación» (nodo de Figma 1096:123152): pantalla de
 * ejemplo del taller. Los registros que agrega el usuario viven en memoria de este componente — no hay solicitud
 * real, backend simulado ni persistencia: «Grabar» solo confirma con un aviso y «Verificar y enviar» queda
 * deshabilitado, porque no hay un flujo de aprobación detrás.
 *
 * Al pulsar (+) en «Registro de clasificador» se abre el panel con «Proceso» (Programación y/o Gestión) y el
 * desplegable «Categoría presupuestaria» (PP, AC, APNOP). Con un proceso y una categoría elegidos aparecen
 * «Estructura programática» (cuatro campos que se eligen con la lupa) y «Vigencia» (Estado «Sí» y fechas que
 * asigna el sistema al aceptarse la solicitud: solo lectura). «Aceptar» se habilita con los cuatro campos
 * elegidos y agrega una fila a la tabla.
 */
@Component({
  selector: 'siaf-clasificador-programatico-request',
  standalone: true,
  imports: [
    ButtonComponent,
    CheckboxComponent,
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
  readonly procesos = PROCESOS_CLASIFICADOR;
  readonly categorias = CATEGORIAS_PRESUPUESTARIAS;

  readonly procesosMarcados = signal<string[]>([]);
  readonly categoria = signal('');

  /** «Estructura programática» y «Vigencia» aparecen cuando ya hay proceso y categoría. */
  readonly mostrarEstructura = computed(() => this.procesosMarcados().length > 0 && !!this.categoria());

  // «Estructura programática»: un campo por catálogo, elegido en el side-nav de selección.
  readonly camposEstructura = CAMPOS_ESTRUCTURA;
  readonly seleccion = signal<Record<CampoEstructura, ItemEstructura | null>>(this.seleccionVacia());
  readonly campoAbierto = signal<CampoEstructura | null>(null);
  readonly busqueda = signal('');
  private readonly tempSeleccionId = signal<string | null>(null);
  readonly tempSeleccionIds = computed<string[]>(() => (this.tempSeleccionId() ? [this.tempSeleccionId()!] : []));

  readonly configCampoAbierto = computed(() => CAMPOS_ESTRUCTURA.find((c) => c.campo === this.campoAbierto()) ?? null);
  readonly filasBusqueda = computed<ItemEstructura[]>(() => {
    const catalogo = this.configCampoAbierto()?.catalogo ?? [];
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return catalogo;
    return catalogo.filter((i) => i.codigo.toLowerCase().includes(texto) || i.denominacion.toLowerCase().includes(texto));
  });
  readonly columnasBusqueda: SelectionColumn<ItemEstructura>[] = [
    { key: 'codigo', label: 'Código', widthClass: 'w-[120px]' },
    { key: 'denominacion', label: 'Denominación' },
  ];

  // «Vigencia»: solo lectura (Estado «Sí»; las fechas las asigna el sistema al aceptarse la solicitud).
  readonly opcionesEstado: RadioOption[] = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' },
  ];

  readonly puedeAceptar = computed(
    () => this.mostrarEstructura() && CAMPOS_ESTRUCTURA.every((c) => !!this.seleccion()[c.campo]),
  );

  // ── Aviso ──────────────────────────────────────────────────────────
  readonly avisoAbierto = signal(false);
  readonly aviso = signal<SnackbarVariant>('record-done');

  estaMarcado(codigo: string): boolean {
    return this.procesosMarcados().includes(codigo);
  }

  marcarProceso(codigo: string, marcado: boolean): void {
    this.procesosMarcados.update((actuales) =>
      marcado ? [...actuales.filter((c) => c !== codigo), codigo] : actuales.filter((c) => c !== codigo),
    );
  }

  abrirPanel(): void {
    this.procesosMarcados.set([]);
    this.categoria.set('');
    this.seleccion.set(this.seleccionVacia());
    this.agregando.set(true);
  }

  cerrarPanel(): void {
    this.agregando.set(false);
  }

  abrirBusqueda(campo: CampoEstructura): void {
    this.busqueda.set('');
    this.tempSeleccionId.set(this.seleccion()[campo]?.id ?? null);
    this.campoAbierto.set(campo);
  }

  cerrarBusqueda(): void {
    this.campoAbierto.set(null);
  }

  onCambioSeleccionBusqueda(ids: string[]): void {
    this.tempSeleccionId.set(ids[0] ?? null);
  }

  onAceptarBusqueda(ids: string[]): void {
    const campo = this.campoAbierto();
    if (campo) {
      const item = this.configCampoAbierto()?.catalogo.find((i) => i.id === ids[0]) ?? null;
      this.seleccion.update((actual) => ({ ...actual, [campo]: item }));
    }
    this.campoAbierto.set(null);
  }

  confirmarRegistro(): void {
    if (!this.puedeAceptar()) return;

    const sel = this.seleccion();
    this.correlativo += 1;
    this.registros.update((registros) => [
      ...registros,
      {
        id: `reg-${this.correlativo}`,
        procesos: this.procesosMarcados(),
        categoriaPresupuestaria: this.categoria(),
        estructura: {
          programa: sel.programa!,
          producto: sel.producto!,
          actividad: sel.actividad!,
          funcional: sel.funcional!,
        },
      },
    ]);

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

  nombreProcesos(codigos: readonly string[]): string {
    return nombreProcesos(codigos);
  }

  private seleccionVacia(): Record<CampoEstructura, ItemEstructura | null> {
    return { programa: null, producto: null, actividad: null, funcional: null };
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }
}

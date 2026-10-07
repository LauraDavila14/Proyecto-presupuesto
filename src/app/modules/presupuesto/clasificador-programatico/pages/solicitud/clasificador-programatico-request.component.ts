import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { TableControlsComponent } from '../../../../../shared/components/table-controls/table-controls.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { RadioComponent, RadioOption } from '../../../../../shared/ui/radio/radio.component';
import { SidePanelComponent } from '../../../../../shared/ui/side-panel/side-panel.component';
import { SnackbarComponent, SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { SummaryCardComponent, SummaryCardField } from '../../../../../shared/ui/summary-card/summary-card.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { PROCESS_ROUTE } from '../../config/clasificador-programatico.rutas';
import {
  CAMPOS_ESTRUCTURA,
  CATEGORIAS_PRESUPUESTARIAS,
  CampoEstructura,
  FINALIDAD_FIJA,
  ItemEstructura,
  PROCESOS_CLASIFICADOR,
  RegistroClasificador,
  codigoFuncional,
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
    FormTableSearchComponent,
    PaginationComponent,
    RadioComponent,
    SidePanelComponent,
    SnackbarComponent,
    SummaryCardComponent,
    TableControlsComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TextFieldComponent,
  ],
  templateUrl: './clasificador-programatico-request.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClasificadorProgramaticoRequestComponent {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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

  // ── Tabla de registros (nodo de Figma 1096:122648) ────────────────
  readonly busquedaRegistros = signal('');
  readonly paginaRegistros = signal(1);
  readonly filasRegistros = signal(10);
  /** Casillas marcadas: solo visuales, no hay acciones sobre la selección. */
  readonly filasMarcadas = signal<string[]>([]);

  /** Filas de la tabla con los códigos que muestra el diseño. */
  readonly filasTabla = computed(() =>
    this.registros().map((r) => ({
      id: r.id,
      categoria: r.categoriaPresupuestaria,
      programa: r.estructura.programa['codigo'],
      producto: r.estructura.producto['codigo'],
      actividad: r.estructura.actividad['codigo'],
      finalidad: FINALIDAD_FIJA,
      funcion: codigoFuncional(r.estructura.funcional['funcion']),
      division: codigoFuncional(r.estructura.funcional['division']),
      grupo: codigoFuncional(r.estructura.funcional['grupo']),
      estado: 'SI',
      fechaDesde: '-',
    })),
  );
  private readonly filasTablaFiltradas = computed(() => {
    const texto = this.busquedaRegistros().trim().toLowerCase();
    if (!texto) return this.filasTabla();
    return this.filasTabla().filter((f) => Object.values(f).some((v) => v.toLowerCase().includes(texto)));
  });
  readonly totalRegistros = computed(() => this.filasTablaFiltradas().length);
  readonly totalPaginasRegistros = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.filasRegistros())));
  readonly filasTablaPagina = computed(() => {
    const desde = (this.paginaRegistros() - 1) * this.filasRegistros();
    return this.filasTablaFiltradas().slice(desde, desde + this.filasRegistros());
  });
  readonly todasMarcadas = computed(() => this.filasTablaPagina().length > 0 && this.filasTablaPagina().every((f) => this.filasMarcadas().includes(f.id)));
  readonly algunaMarcada = computed(() => this.filasMarcadas().length > 0 && !this.todasMarcadas());

  buscarRegistros(texto: string): void {
    this.busquedaRegistros.set(texto);
    this.paginaRegistros.set(1);
  }

  cambiarPaginaRegistros(delta: number): void {
    this.paginaRegistros.update((p) => Math.min(this.totalPaginasRegistros(), Math.max(1, p + delta)));
  }

  cambiarFilasRegistros(filas: number): void {
    this.filasRegistros.set(filas);
    this.paginaRegistros.set(1);
  }

  marcarTodas(marcar: boolean): void {
    this.filasMarcadas.set(marcar ? this.filasTablaPagina().map((f) => f.id) : []);
  }

  marcarFila(id: string, marcar: boolean): void {
    this.filasMarcadas.update((m) => (marcar ? [...m.filter((x) => x !== id), id] : m.filter((x) => x !== id)));
  }

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
  readonly tempSeleccionId = signal<string | null>(null);
  readonly hayFilaElegida = computed(() => !!this.tempSeleccionId());

  readonly configCampoAbierto = computed(() => CAMPOS_ESTRUCTURA.find((c) => c.campo === this.campoAbierto()) ?? null);
  readonly columnasBusqueda = computed(() => this.configCampoAbierto()?.columnas ?? []);

  // Paginación de la ventana de selección (en memoria).
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(10);
  private readonly filasFiltradas = computed<ItemEstructura[]>(() => {
    const catalogo = this.configCampoAbierto()?.catalogo ?? [];
    const texto = this.busqueda().trim().toLowerCase();
    if (!texto) return catalogo;
    return catalogo.filter((i) => Object.values(i).some((valor) => valor.toLowerCase().includes(texto)));
  });
  readonly totalFilas = computed(() => this.filasFiltradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasBusqueda = computed<ItemEstructura[]>(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    return this.filasFiltradas().slice(desde, desde + this.filasPorPagina());
  });

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
    this.pagina.set(1);
    this.tempSeleccionId.set(this.seleccion()[campo]?.id ?? null);
    this.campoAbierto.set(campo);
  }

  buscar(texto: string): void {
    this.busqueda.set(texto);
    this.pagina.set(1);
  }

  cambiarPagina(delta: number): void {
    this.pagina.update((p) => Math.min(this.totalPaginas(), Math.max(1, p + delta)));
  }

  cambiarFilasPorPagina(filas: number): void {
    this.filasPorPagina.set(filas);
    this.pagina.set(1);
  }

  /** Campos de la `siaf-summary-card` de un campo elegido: una etiqueta/valor por cada columna de su búsqueda. */
  camposCard(campo: CampoEstructura, item: ItemEstructura): SummaryCardField[] {
    const columnas = CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)!.columnas;
    return columnas.map((c) => ({ label: c.label, value: item[c.key], widthClass: c.anchoCard }));
  }

  /** Quita la selección de un campo (✕ de la card): reactiva su lupa y le devuelve el foco. */
  quitarSeleccion(campo: CampoEstructura, titulo: string): void {
    this.seleccion.update((actual) => ({ ...actual, [campo]: null }));
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(`button[aria-label="Buscar ${titulo.toLowerCase()}"]`)?.focus());
  }

  resumen(campo: CampoEstructura, item: ItemEstructura): string {
    return CAMPOS_ESTRUCTURA.find((c) => c.campo === campo)!.resumen(item);
  }

  cerrarBusqueda(): void {
    this.campoAbierto.set(null);
  }

  seleccionarFila(id: string): void {
    this.tempSeleccionId.set(id);
  }

  onAceptarBusqueda(): void {
    const campo = this.campoAbierto();
    if (campo) {
      const item = this.configCampoAbierto()?.catalogo.find((i) => i.id === this.tempSeleccionId()) ?? null;
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

  grabar(): void {
    if (this.saveDisabled()) return;
    this.mostrarAviso('changes-saved');
  }

  regresar(): void {
    void this.router.navigate([PROCESS_ROUTE]);
  }

  private seleccionVacia(): Record<CampoEstructura, ItemEstructura | null> {
    return { programa: null, producto: null, actividad: null, funcional: null };
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }
}

import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CurrentUserService } from '../../../../../core/auth/current-user.service';
import { BreadcrumbItem } from '../../../../../shared/components/breadcrumb/breadcrumb.component';
import { FormTableSearchComponent } from '../../../../../shared/components/form-table-search/form-table-search.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { RequestApprovalModalsComponent } from '../../../../../shared/components/request-approval-modals/request-approval-modals.component';
import { SolicitudeHeaderState } from '../../../../../shared/components/solicitude-header/solicitude-header.component';
import { SolicitudeInfoCardComponent, SolicitudeInfoField } from '../../../../../shared/components/solicitude-info-card/solicitude-info-card.component';
import { SolicitudePageLayoutComponent } from '../../../../../shared/components/solicitude-page-layout/solicitude-page-layout.component';
import { TableControlsComponent } from '../../../../../shared/components/table-controls/table-controls.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { CheckboxComponent } from '../../../../../shared/ui/checkbox/checkbox.component';
import { DateTimePickerComponent } from '../../../../../shared/ui/date-time-picker/date-time-picker.component';
import { DocumentSummaryCardComponent } from '../../../../../shared/ui/document-summary-card/document-summary-card.component';
import { RadioComponent, RadioOption } from '../../../../../shared/ui/radio/radio.component';
import { ReadonlyFieldComponent } from '../../../../../shared/ui/readonly-field/readonly-field.component';
import { SidePanelComponent } from '../../../../../shared/ui/side-panel/side-panel.component';
import { SnackbarComponent, SnackbarVariant } from '../../../../../shared/ui/snackbar/snackbar.component';
import { TagComponent } from '../../../../../shared/ui/tag/tag.component';
import { TextFieldComponent } from '../../../../../shared/ui/text-field/text-field.component';
import { PROCESS_ROUTE } from '../../config/clasificador-programatico.rutas';
import {
  CADENAS_ACTIVIDAD,
  CADENAS_PP,
  CATEGORIAS_PRESUPUESTARIAS,
  CadenaClasificador,
  PROCESOS_CLASIFICADOR,
  RegistroClasificador,
  TIPOS_CADENA_ACTIVIDAD,
  TIPOS_CADENA_PP,
} from '../../models/clasificador-programatico.model';

/** Una cadena con la categoría presupuestaria del registro, tal como la muestran las grillas. */
type FilaCadena = CadenaClasificador & { categoria: string };

/** Una columna de las grillas de cadenas. */
interface ColumnaCadena {
  key: keyof FilaCadena;
  label: string;
}

/** Filtros del panel «Seleccionar cadena»; vacío = sin filtrar. */
interface FiltrosCadena {
  tipo: string;
  programa: string;
  producto: string;
  actividad: string;
  funcion: string;
  division: string;
  grupo: string;
}

const SIN_FILTROS: FiltrosCadena = { tipo: '', programa: '', producto: '', actividad: '', funcion: '', division: '', grupo: '' };

/** Lo que muestra el resumen de registros cuando la cadena no tiene programa ni producto/proyecto. */
const CODIGO_PROGRAMA_VACIO = '0000';
const CODIGO_PRODUCTO_VACIO = '0000000';

const COLUMNAS_FUNCIONAL: ColumnaCadena[] = [
  { key: 'funcion', label: 'Función' },
  { key: 'division', label: 'División' },
  { key: 'grupo', label: 'Grupo' },
];
const COLUMNAS_ESTRUCTURA_PP: ColumnaCadena[] = [
  { key: 'programa', label: 'Programa' },
  { key: 'producto', label: 'Producto/Proyecto' },
  { key: 'actividad', label: 'Actividad/Acción Inversión/Obra' },
];
const COLUMNAS_ESTRUCTURA_ACTIVIDAD: ColumnaCadena[] = [{ key: 'actividad', label: 'Actividad/Acción Inversión/Obra' }];
const COLUMNA_CATEGORIA: ColumnaCadena = { key: 'categoria', label: 'Categ. pptal' };

/** Desplegables del panel de filtros: PP filtra por toda la estructura; AC y APNOP, solo por la actividad. */
const FILTROS_PP: { clave: keyof FiltrosCadena; label: string }[] = [
  { clave: 'programa', label: 'Programa' },
  { clave: 'producto', label: 'Producto' },
  { clave: 'actividad', label: 'Actividad' },
  { clave: 'funcion', label: 'Función' },
  { clave: 'division', label: 'División funcional' },
  { clave: 'grupo', label: 'Grupo funcional' },
];
const FILTROS_ACTIVIDAD = FILTROS_PP.filter((f) => !['programa', 'producto'].includes(f.clave));

/**
 * Solicitud de clasificador programático, tipo de acción «Creación»: pantalla de ejemplo del taller. Los registros
 * que agrega el usuario viven en memoria de este componente — no hay solicitud real, backend simulado ni
 * persistencia: «Grabar» abre su confirmación y deja el documento Elaborado, y «Verificar y enviar» se habilita solo
 * con el documento elaborado.
 *
 * Al pulsar (+) en «Registro de clasificador» se abre el panel con «Proceso» (Programación y/o Gestión) y el
 * desplegable «Categoría presupuestaria» (PP, AC, APNOP). Con un proceso y una categoría elegidos aparece «Buscar
 * cadena» (nodos de Figma 1391:117188 y 1391:117304): su lupa abre el panel «Seleccionar cadena» (`siaf-side-panel`
 * con panel de filtros), donde se marcan una o varias cadenas ya existentes. Al aceptar quedan en una tabla dentro
 * del registro. «Aceptar» se habilita con al menos una cadena y agrega una fila al resumen por cada cadena elegida.
 */
@Component({
  selector: 'siaf-clasificador-programatico-request',
  standalone: true,
  imports: [
    ButtonComponent,
    CheckboxComponent,
    DateTimePickerComponent,
    DocumentSummaryCardComponent,
    FormTableSearchComponent,
    NgTemplateOutlet,
    PaginationComponent,
    RadioComponent,
    ReadonlyFieldComponent,
    RequestApprovalModalsComponent,
    SidePanelComponent,
    SnackbarComponent,
    SolicitudeInfoCardComponent,
    SolicitudePageLayoutComponent,
    TableControlsComponent,
    TagComponent,
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

  // ── Estado del documento (nodo de Figma 1232:139248) ───────────────
  // Nuevo → «Grabar» (modal) → Elaborado (solo lectura: Eliminar, Editar, Verificar y enviar). «Editar» vuelve a
  // la edición con los registros. No hay backend: el N°, «Elaborado por» y la fecha viven en memoria.
  readonly elaborado = signal(false);
  readonly enEdicion = signal(false);
  readonly numeroDocumento = signal('');
  readonly elaboradoPor = signal('');
  readonly fechaElaboracion = signal('');
  readonly headerState = computed<SolicitudeHeaderState>(() => (this.elaborado() ? 'elaborated' : this.enEdicion() ? 'edit' : 'new'));
  /** «Verificar y enviar» solo se habilita con el documento elaborado. */
  readonly verifyDisabled = computed(() => !this.elaborado());

  readonly modalGrabar = signal(false);
  readonly modalVerificar = signal(false);
  readonly modalEliminar = signal(false);
  private numeroSiguiente = 1;

  // ── Resumen de registros (nodo de Figma 1096:122648) ──────────────
  readonly busquedaRegistros = signal('');
  readonly paginaRegistros = signal(1);
  readonly filasRegistros = signal(10);
  /** Casillas marcadas: solo visuales, no hay acciones sobre la selección. */
  readonly filasMarcadas = signal<string[]>([]);

  /** Filas del resumen con los códigos que muestra el diseño. */
  readonly filasTabla = computed(() =>
    this.registros().map((r) => ({
      id: r.id,
      categoria: r.categoriaPresupuestaria,
      programa: r.cadena.programa || CODIGO_PROGRAMA_VACIO,
      producto: r.cadena.producto || CODIGO_PRODUCTO_VACIO,
      actividad: r.cadena.actividad,
      funcion: r.cadena.funcion,
      division: r.cadena.division,
      grupo: r.cadena.grupo,
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

  /** «Buscar cadena» y «Vigencia» aparecen cuando ya hay proceso y categoría. */
  readonly mostrarCadena = computed(() => this.procesosMarcados().length > 0 && !!this.categoria());
  readonly esPP = computed(() => this.categoria() === 'PP');

  /** Catálogo de cadenas de la categoría: PP trae programa y producto; AC y APNOP, solo la actividad. */
  private readonly catalogoCadenas = computed<CadenaClasificador[]>(() => (this.esPP() ? CADENAS_PP : CADENAS_ACTIVIDAD));
  private readonly tiposCadena = computed<RadioOption[]>(() => (this.esPP() ? TIPOS_CADENA_PP : TIPOS_CADENA_ACTIVIDAD));
  readonly opcionesTipo = this.tiposCadena;
  readonly camposFiltro = computed(() => (this.esPP() ? FILTROS_PP : FILTROS_ACTIVIDAD));

  readonly columnasEstructura = computed<ColumnaCadena[]>(() => (this.esPP() ? COLUMNAS_ESTRUCTURA_PP : COLUMNAS_ESTRUCTURA_ACTIVIDAD));
  readonly columnasFuncional = COLUMNAS_FUNCIONAL;
  /** El panel «Seleccionar cadena» suma la categoría; la tabla del registro no (Figma 1391:117304). */
  readonly columnasEstructuraPanel = computed<ColumnaCadena[]>(() => [COLUMNA_CATEGORIA, ...this.columnasEstructura()]);

  // Cadenas elegidas, en la tabla de «Buscar cadena».
  readonly cadenasElegidas = signal<CadenaClasificador[]>([]);
  readonly busquedaCadenas = signal('');
  readonly paginaCadenas = signal(1);
  readonly filasCadenas = signal(25);
  /** Casillas marcadas de la tabla: se puede marcar cualquier registro, sin más acción. */
  readonly marcadasCadenas = signal<string[]>([]);

  private readonly filasElegidas = computed<FilaCadena[]>(() => this.conCategoria(this.cadenasElegidas()));
  private readonly filasElegidasFiltradas = computed(() => this.filtrarPorTexto(this.filasElegidas(), this.busquedaCadenas()));
  readonly totalCadenas = computed(() => this.filasElegidasFiltradas().length);
  readonly totalPaginasCadenas = computed(() => Math.max(1, Math.ceil(this.totalCadenas() / this.filasCadenas())));
  readonly filasCadenasPagina = computed(() => {
    const desde = (this.paginaCadenas() - 1) * this.filasCadenas();
    return this.filasElegidasFiltradas().slice(desde, desde + this.filasCadenas());
  });

  readonly puedeAceptar = computed(() => this.mostrarCadena() && this.cadenasElegidas().length > 0);

  // «Vigencia»: solo lectura (Estado «Sí»; las fechas las asigna el sistema al aceptarse la solicitud).
  readonly opcionesEstado: RadioOption[] = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' },
  ];

  buscarEnCadenas(texto: string): void {
    this.busquedaCadenas.set(texto);
    this.paginaCadenas.set(1);
  }

  cambiarPaginaCadenas(delta: number): void {
    this.paginaCadenas.update((p) => Math.min(this.totalPaginasCadenas(), Math.max(1, p + delta)));
  }

  cambiarFilasCadenas(filas: number): void {
    this.filasCadenas.set(filas);
    this.paginaCadenas.set(1);
  }

  marcarCadena(id: string, marcar: boolean): void {
    this.marcadasCadenas.update((m) => (marcar ? [...m.filter((x) => x !== id), id] : m.filter((x) => x !== id)));
  }

  // ── Panel «Seleccionar cadena» (siaf-side-panel con filtros) ───────
  readonly panelCadenaAbierto = signal(false);
  readonly busqueda = signal('');
  readonly pagina = signal(1);
  readonly filasPorPagina = signal(25);
  /** Cadenas marcadas en el panel; «Aceptar» las pasa a la tabla del registro. */
  readonly marcadasPanel = signal<string[]>([]);
  readonly filtrosAbiertos = signal(false);
  readonly filtros = signal<FiltrosCadena>({ ...SIN_FILTROS });
  readonly filtrosBorrador = signal<FiltrosCadena>({ ...SIN_FILTROS });

  /** «Aplicar» se habilita cuando el borrador difiere de lo ya aplicado. */
  readonly borradorCambiado = computed(() => JSON.stringify(this.filtrosBorrador()) !== JSON.stringify(this.filtros()));
  readonly chipsFiltros = computed(() => {
    const f = this.filtros();
    return [f.tipo, f.programa, f.producto, f.actividad, f.funcion, f.division, f.grupo].filter(Boolean);
  });

  private readonly cadenasFiltradas = computed<FilaCadena[]>(() => {
    const f = this.filtros();
    const filas = this.conCategoria(this.catalogoCadenas()).filter(
      (c) =>
        (!f.tipo || c.tipo === f.tipo) &&
        (!f.programa || c.programa === f.programa) &&
        (!f.producto || c.producto === f.producto) &&
        (!f.actividad || c.actividad === f.actividad) &&
        (!f.funcion || c.funcion === f.funcion) &&
        (!f.division || c.division === f.division) &&
        (!f.grupo || c.grupo === f.grupo),
    );
    return this.filtrarPorTexto(filas, this.busqueda());
  });
  readonly totalFilas = computed(() => this.cadenasFiltradas().length);
  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalFilas() / this.filasPorPagina())));
  readonly filasPanel = computed<FilaCadena[]>(() => {
    const desde = (this.pagina() - 1) * this.filasPorPagina();
    return this.cadenasFiltradas().slice(desde, desde + this.filasPorPagina());
  });

  abrirCadena(): void {
    this.busqueda.set('');
    this.pagina.set(1);
    this.filasPorPagina.set(25);
    // Abre con el panel de filtros visible y el primer Tipo marcado, sin aplicar todavía.
    this.filtros.set({ ...SIN_FILTROS });
    this.filtrosBorrador.set({ ...SIN_FILTROS, tipo: this.tiposCadena()[0].value });
    this.filtrosAbiertos.set(true);
    this.marcadasPanel.set(this.cadenasElegidas().map((c) => c.id));
    this.panelCadenaAbierto.set(true);
  }

  cerrarCadena(): void {
    this.panelCadenaAbierto.set(false);
    this.filtrosAbiertos.set(false);
  }

  onAceptarCadena(): void {
    const ids = this.marcadasPanel();
    this.cadenasElegidas.set(this.catalogoCadenas().filter((c) => ids.includes(c.id)));
    this.marcadasCadenas.set([]);
    this.paginaCadenas.set(1);
    this.cerrarCadena();
  }

  marcarEnPanel(id: string, marcar: boolean): void {
    this.marcadasPanel.update((m) => (marcar ? [...m.filter((x) => x !== id), id] : m.filter((x) => x !== id)));
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

  abrirFiltros(): void {
    const f = this.filtros();
    this.filtrosBorrador.set(this.chipsFiltros().length > 0 ? { ...f } : { ...SIN_FILTROS, tipo: this.tiposCadena()[0].value });
    this.filtrosAbiertos.set(true);
  }

  cerrarFiltros(): void {
    this.filtrosAbiertos.set(false);
  }

  cambiarFiltro<K extends keyof FiltrosCadena>(campo: K, valor: FiltrosCadena[K]): void {
    this.filtrosBorrador.update((f) => ({
      ...f,
      [campo]: valor,
      // Al cambiar el Tipo, los desplegables dependientes se vacían.
      ...(campo === 'tipo' ? { programa: '', producto: '', actividad: '', funcion: '', division: '', grupo: '' } : {}),
    }));
  }

  aplicarFiltros(): void {
    this.filtros.set({ ...this.filtrosBorrador() });
    this.pagina.set(1);
    this.filtrosAbiertos.set(false);
  }

  borrarFiltros(): void {
    this.filtros.set({ ...SIN_FILTROS });
    this.pagina.set(1);
  }

  /** Opciones de un desplegable del panel de filtros: los valores del catálogo, del Tipo marcado en el borrador. */
  opcionesDe(clave: keyof FiltrosCadena): { label: string; value: string }[] {
    const tipo = this.filtrosBorrador().tipo;
    const valores = this.catalogoCadenas()
      .filter((c) => !tipo || c.tipo === tipo)
      .map((c) => c[clave])
      .filter(Boolean);
    return [...new Set(valores)].map((v) => ({ label: v, value: v }));
  }

  // ── Panel «Registro de clasificador»: acciones ─────────────────────
  estaMarcado(codigo: string): boolean {
    return this.procesosMarcados().includes(codigo);
  }

  marcarProceso(codigo: string, marcado: boolean): void {
    this.procesosMarcados.update((actuales) =>
      marcado ? [...actuales.filter((c) => c !== codigo), codigo] : actuales.filter((c) => c !== codigo),
    );
  }

  cambiarCategoria(categoria: string): void {
    if (categoria === this.categoria()) return;
    this.categoria.set(categoria);
    // Las cadenas dependen de la categoría: se vacían.
    this.reiniciarCadenas();
  }

  abrirPanel(): void {
    this.procesosMarcados.set([]);
    this.categoria.set('');
    this.reiniciarCadenas();
    this.agregando.set(true);
  }

  cerrarPanel(): void {
    this.agregando.set(false);
  }

  confirmarRegistro(): void {
    if (!this.puedeAceptar()) return;

    this.registros.update((registros) => [
      ...registros,
      ...this.cadenasElegidas().map((cadena) => ({
        id: `reg-${++this.correlativo}`,
        procesos: this.procesosMarcados(),
        categoriaPresupuestaria: this.categoria(),
        cadena,
      })),
    ]);

    this.agregando.set(false);
    this.mostrarAviso('record-done');
  }

  grabar(): void {
    if (this.saveDisabled()) return;
    this.modalGrabar.set(true);
  }

  onConfirmarGrabar(): void {
    this.modalGrabar.set(false);
    if (!this.elaborado()) {
      this.numeroDocumento.set(String(this.numeroSiguiente++).padStart(4, '0'));
      this.elaboradoPor.set(this.currentUser.name);
    }
    this.fechaElaboracion.set(this.fechaYHoraActual());
    this.agregando.set(false);
    this.enEdicion.set(false);
    this.elaborado.set(true);
    this.mostrarAviso('creation-elaborated');
  }

  editar(): void {
    this.elaborado.set(false);
    this.enEdicion.set(true);
  }

  onConfirmarVerificar(): void {
    this.modalVerificar.set(false);
    this.mostrarAviso('creation-verified');
    this.regresar();
  }

  onConfirmarEliminar(): void {
    this.modalEliminar.set(false);
    this.mostrarAviso('creation-deleted');
    this.regresar();
  }

  regresar(): void {
    void this.router.navigate([PROCESS_ROUTE]);
  }

  // ── Aviso ──────────────────────────────────────────────────────────
  readonly avisoAbierto = signal(false);
  readonly aviso = signal<SnackbarVariant>('record-done');

  private reiniciarCadenas(): void {
    this.cadenasElegidas.set([]);
    this.marcadasCadenas.set([]);
    this.busquedaCadenas.set('');
    this.paginaCadenas.set(1);
  }

  private conCategoria(cadenas: CadenaClasificador[]): FilaCadena[] {
    return cadenas.map((c) => ({ ...c, categoria: this.categoria() }));
  }

  private filtrarPorTexto(filas: FilaCadena[], texto: string): FilaCadena[] {
    const t = texto.trim().toLowerCase();
    if (!t) return filas;
    return filas.filter((f) => [f.categoria, f.tipo, f.programa, f.producto, f.actividad, f.funcion, f.division, f.grupo].some((v) => v.toLowerCase().includes(t)));
  }

  private fechaYHoraActual(): string {
    const ahora = new Date();
    const dos = (n: number): string => String(n).padStart(2, '0');
    return `${dos(ahora.getDate())}/${dos(ahora.getMonth() + 1)}/${ahora.getFullYear()}   ${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}`;
  }

  private mostrarAviso(variante: SnackbarVariant): void {
    this.aviso.set(variante);
    this.avisoAbierto.set(true);
  }
}
